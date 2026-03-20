const testQuestions = require("./questions")

class Game {
    constructor(players, lobbyId) {
        this.players = players;
        this.lobbyId = lobbyId;
        this.questionIndex = 0;
        this.answers = new Map();
        this.scores = new Map();
    }

    startGame(io) {
        
    }

    sendQuestion(io) {

    }

    submitAnswer(socketId, answer, io) {

    }
}

module.exports = Game;