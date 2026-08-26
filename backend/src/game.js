const allQuestions = require("./questions")

class Game {
    constructor(lobby) {
        this.lobby = lobby;
        this.settings = lobby.settings; // lobby beállítások rögzítése

        this.questionIndex = 0;
        this.questions = allQuestions(this.settings.category, this.settings.rounds); // Legenerálja a kérdéseket
        this.questionStartTime = null;
        
        this.maxTime = this.settings.maxQuestionTime; // max idő válaszadásra (ms)
        this.timer = null; // ez felel az időzítőért

        this.state = "waiting";

        this.scores = {};
        this.answers = new Set(); // ki válaszolt már

        this.ended = false;

        // Mindenkinek kezdetben 0 pont
        for (const player of lobby.players.values()) {
            const key = this.getPlayerKey(player);
            this.scores[key] = 0;
        }
    }

    // JÁTÉKOS AZONOSÍTÁSA
    getPlayerKey(player) {
        return player.userId || player.sessionId;
    }

    getSocketIdByPlayerKey(targetKey) {
        for (let [socketId, player] of this.lobby.players.entries()) {
            const key = player.userId || player.sessionId;
    
            if (key === targetKey) {
                return socketId;
            }
        }
    
        return null; // ha nincs találat
    }

    startGame(io) {
        console.log("Game.start called");

        this.state = "playing";

        this.sendQuestion(io);
    }

    sendQuestion(io) {
        const q = this.questions[this.questionIndex];
        
        this.state = "question";
        this.isNextRound = false;
        this.ended = false;
        this.answers.clear();
        this.questionStartTime = Date.now();

        // Törli a timert, ha van
        if (this.timer) {
            clearTimeout(this.timer);
        }

        io.to(this.lobby.id).emit("game:question", {
            question: q.question,
            answers: q.answers,
            maxTime: this.maxTime
        });

        // Időzítő a kör végére
        this.timer = setTimeout(() => {
            console.log("\nLejárt az idő!");
            this.endQuestion(io);
        }, this.maxTime);
    }

    getActivePlayerCount() {
        return [...this.lobby.players.values()]
            .map(p => this.getPlayerKey(p))
            .filter(Boolean).length;
    }

    submitAnswer(socketId, answer, io) {
        if (this.state !== "question") return;

        const player = this.lobby.players.get(socketId);
        if (!player) return;

        const key = this.getPlayerKey(player);
        if (this.answers.has(key)) return;

        const q = this.questions[this.questionIndex];
        
        console.log("\n\nSzámoljuk a pontokat neki:\n", player);
        this.answers.add(key);
        const isCorrect = answer === q.correct;
        const timeTaken = Date.now() - this.questionStartTime;
        const points = isCorrect ? this.pointCalculator(timeTaken) : 0;
        this.scores[key] = (this.scores[key] || 0) + points;

        if (this.answers.size === this.getActivePlayerCount()) {
            console.log("Mindenki válaszolt!");
            this.endQuestion(io);
        }
    }

    pointCalculator(time) { //mindkét változónak ugyanaz az időform. kell
        const TIME_LIMIT = 60000; // Maximum idő, amit be lehet állítani
        const MAX_POINT = 100;

        const funcWeight = this.maxTime / TIME_LIMIT;
        const hatv = Math.pow(10,-(time / this.maxTime));
        const exp = MAX_POINT * hatv;
        const linear = (10 - MAX_POINT) / this.maxTime * time + MAX_POINT;

        const result = funcWeight * exp + (1 - funcWeight) * linear;

        return Math.round(result);
    }

    endQuestion(io) {
        if (this.ended) return;
        this.ended = true;

        // Töröljük az időzítőt, hogyha van
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        const q = this.questions[this.questionIndex];

        this.state = "result";
        
        let scoresWithNames = [];

        for (let player of this.lobby.players.values()) {
            let key = this.getPlayerKey(player);

            scoresWithNames.push({
                socketId: this.getSocketIdByPlayerKey(key),
                name: player?.nickname || "Unknown",
                score: this.scores[key]
            });
        }

        // rendezés csökkenő sorrendbe score alapján
        scoresWithNames.sort((a, b) => b.score - a.score);

        io.to(this.lobby.id).emit("game:result", {
            correct: q.correct,
            scores: scoresWithNames
        });


        setTimeout(() => {
            this.isNextRound = true;
            this.nextQuestion(io);
        }, 10000);

    }

    nextQuestion(io) {
        this.questionIndex++;

        if (this.questionIndex >= this.questions.length) {
            this.endGame(io);
            return;
        }

        console.log("Current Q index: " + this.questionIndex);
        this.sendQuestion(io);
    }

    endGame(io) {
        this.state = "ended";

        const xpMap = this.calculateXP();
        this.saveXP(xpMap);

        let scoresWithNames = [];

        for (let player of this.lobby.players.values()) {
            let key = this.getPlayerKey(player);
            const socketId = this.getSocketIdByPlayerKey(key);
            const playerXP = xpMap[key] || 0;

            scoresWithNames.push({
                socketId: this.getSocketIdByPlayerKey(key),
                name: player?.nickname || "Unknown",
                score: this.scores[key],
                xp: playerXP
            });

            if (socketId) {
                io.to(socketId).emit("user:update_xp", playerXP);
            }
        }
        
        // rendezés csökkenő sorrendbe score alapján
        scoresWithNames.sort((a, b) => b.score - a.score);

       if (this.lobby.type === "ranked") {
            this.saveRank();
        }

        io.to(this.lobby.id).emit("game:end", scoresWithNames);
    }

    // XP számolás
    calculateXP() {
        const sorted = Object.entries(this.scores)
            .sort((a, b) => b[1] - a[1]);

        const xpMap = {};

        sorted.forEach(([key, score], index) => {
            let xp = 0;
            if (index === 0) xp += 100;
            xp += score;
            xpMap[key] = xp;
        });

        return xpMap;
    }

    saveXP(xpMap) {
        const queries = [];

        for (const player of this.lobby.players.values()) {
            if (!player.userId) continue;

            const key = this.getPlayerKey(player);
            const xp = xpMap[key] || 0;

            queries.push(
                this.lobby.dbManager.query(
                    "UPDATE users SET xp = xp + $1 WHERE user_id = $2",
                    [xp, player.userId]
                )
            );
        }

        Promise.all(queries).catch(console.error);
    }

    async saveRank() {
        // Sorrendbe állítjuk a játékosokat a meccsen elért pontjaik (score) alapján
        const sortedScores = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
        
        // A legelső a győztes kulcsa (userId vagy sessionId)
        const winnerKey = sortedScores[0][0];

        const queries = [];

        for (const player of this.lobby.players.values()) {
            if (!player.userId) continue; // Csak regisztrált felhasználó kap rangot

            const key = this.getPlayerKey(player);
            const isWinner = (key === winnerKey);
            
            // TESZT
            const pointChange = isWinner ? 25 : -10; 

            queries.push(
                this.lobby.dbManager.query(
                    `UPDATE users 
                     SET rang = GREATEST(0, rang + $1) 
                     WHERE user_id = $2`,
                    [pointChange, player.userId]
                )
            );
        }

        try {
            await Promise.all(queries);
            console.log(`Rank updated for RankedLobby: ${this.lobby.id}`);
        } catch (err) {
            console.error("Hiba a rank mentésekor: ", err);
        }
    }
    
}

module.exports = Game;