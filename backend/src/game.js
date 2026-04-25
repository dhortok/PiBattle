const allQuestions = require("./questions")

class Game {
    constructor(lobby) {
        this.lobby = lobby;
        this.questionIndex = 0;
        this.questions = allQuestions("algb", 5); // TESZT
        // this.questions = QuestionsGen.allQuestions(lobby.category, lobby.maxQuestion); // REAL
        this.questionStartTime = null;
        this.maxTime = 30000; //milisec TESZT (30 sec)
        // this.maxTime = lobby.maxTime * 1000; //milisec REAL
        this.timer = null; // ez felel az időzítőért
        this.answers = new Map();
        this.scores = new Map();
    }

    startGame(io) {

        // Mindenkinek kezdetben 0 pont
        this.lobby.players.forEach((_, id) => {
            this.scores.set(id, 0)
        });


        console.log("Game.start called");

        this.sendQuestion(io);
    }

    sendQuestion(io) {
        const q = this.questions[this.questionIndex];
        
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
            console.log("Lejárt az idő!\nSzámoljuk a pontokat!");
            this.scoreCalculate(io);
        }, this.maxTime);
    }

    submitAnswer(socketId, answer, io) {
        if (this.answers.has(socketId)) return;

        const timeTaken = Date.now() - this.questionStartTime;

        this.answers.set(socketId, {answer, time:timeTaken});

        // TESZT: később időig fog menni
        if (this.answers.size === this.lobby.players.size) {
            console.log("Mindenki válaszolt!\nSzámoljuk a pontokat!");
            this.scoreCalculate(io);
        }
    }

    static pointCalculator(time, maxTime) { //mindkét változónak ugyanaz az időform. kell
        let point = 100;
        const hatv = Math.pow(10,-(time / maxTime));

        point *= hatv;

        return Math.round(point);
    }

    scoreCalculate(io) {
        if (this.ended) return;
        this.ended = true;

        // Töröljük az időzítőt, hogyha van
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        const q = this.questions[this.questionIndex];

        this.answers.forEach((data, socketId) => {
            if (data.answer === q.correct) {
                const score = Game.pointCalculator(data.time, this.maxTime);
                this.scores.set(socketId, this.scores.get(socketId) + score);
            }
        });

        io.to(this.lobby.id).emit("game:result", {
            correct: q.correct,
            scores: Object.fromEntries(this.scores)
        })


        setTimeout(() => {
            this.isNextRound = true;
            this.nextQuestion(io);
        }, 10000);

    }

    nextQuestion(io) {
        this.questionIndex++;

        if (this.questionIndex >= this.questions.length) {
            this.end(io);
            return;
        }

        console.log("Current Q index: " + this.questionIndex);
        this.sendQuestion(io);
    }

    end(io) {
        io.to(this.lobby.id).emit("game:end", {
            scores: Object.fromEntries(this.scores)
        });

        this.lobby.state = "waiting";
    }
}

module.exports = Game;