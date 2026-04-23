const Game = require("./game");

class Lobby {
    constructor(id, host) {
        this.id = id;
        this.host = host;
        this.players = new Map();
        this.maxPlayer = 10;
        this.state = "waiting" // State: waiting, ingame
        this.game = null;
        this.guest = 1;
    }

    addPlayer(socket, nickname="Guest") {
        if (this.players.size >= this.maxPlayer) return false;

        this.players.set(socket.id, {
            socketId: socket.id,
            nickname: (nickname==="Guest") ? nickname + (this.guest++) : nickname,
            userId: socket.user?.userId || null,
            // score: 0
        });

        return true;
    }

    removePlayer(socket){
        this.players.delete(socket.id);

        if (this.host === socket.id) {
            const next = this.players.keys().next().value;
            this.host = next || null;
        }
    }

    getPlayerList() {
        return [...this.players.values()];
    }

    startGame(io) {
        if (this.state != "waiting") return null;
        if (this.game) return null;

        this.game = new Game(this);
        this.state = "playing";

        this.game.startGame(io);

        return this.game;
    }
}


class LobbyManager {
    constructor() {
        this.lobbies = new Map();
    }

    createLobby(socket) {
        const id = this.generateLobbyId();

        const lobby = new Lobby(id, socket.id);
        lobby.addPlayer(socket);

        this.lobbies.set(id, lobby);

        console.log(this.lobbies);

        return lobby;
    }

    joinLobby(lobbyId, socket) {
        const lobby = this.lobbies.get(lobbyId);
        
        if (!lobby) return null;

        if (lobby.state != "waiting") return null;

        if (!lobby.addPlayer(socket)) return null;

        return lobby;
    }

    leaveLobby(socket){
        for (const lobby of this.lobbies.values()) {

            if (lobby.players.has(socket.id)) {

                lobby.removePlayer(socket.id);

                if (lobby.players.size === 0) {
                    this.lobbies.delete(lobby.id);
                }

                return lobby;
            }
        }

        return null;
    }

    generateLobbyId() {
        let id;

        do {
            // id kiosztás
            id = Math.random().toString(36).substring(2, 6).toUpperCase();
        } while (this.lobbies.has(id));

        return id;
    }
}

module.exports = LobbyManager;