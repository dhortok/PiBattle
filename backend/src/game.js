const allQuestions = require("./questions")

class Game {
    constructor(lobby) {
        this.lobby = lobby;
        this.questionIndex = 0;
        this.questions = allQuestions("algb", 5); // TESZT
        // this.questions = QuestionsGen.allQuestions(lobby.category, lab.maxQuestion);
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

        this.answers.clear();

        io.to(this.lobby.id).emit("game:question", {
            question: q.question,
            answers: q.answers
        });
    }

    submitAnswer(socketId, answer, io) {
        if (this.answers.has(socketId)) return;

        this.answers.set(socketId, answer);

        // TESZT: később időig fog menni
        if (this.answers.size === this.lobby.players.size) {
            console.log("Számoljuk a pontokat!");
            this.scoreCalculate(io);
        }
    }

    scoreCalculate(io) {
        const q = this.questions[this.questionIndex];

        this.answers.forEach((answer, socketId) => {
            if (answer === q.correct) {
                this.scores.set(socketId, this.scores.get(socketId) + 1);
            }
        });

        io.to(this.lobby.id).emit("game:result", {
            correct: q.correct,
            scores: Object.fromEntries(this.scores)
        })

        setTimeout(() => {
            this.nextQuestion(io);
        }, 5000);
    }

    nextQuestion(io) {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex >= this.questions.length) {
            this.end(io);
            return;
        }

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