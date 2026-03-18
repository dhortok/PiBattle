class Lobby {
    constructor(id, host) {
        this.id = id;
        this.host = host;
        this.players = new Map();
        this.maxPlayer = 10;
        this.state = "waiting" // State: waiting, ingame
    }

    addPlayer(socket) {
        if (this.players.size >= this.maxPlayer) return false;

        this.players.set(socket.id, "player")

        return true;
    }

    removePlayer(socket){

    }

    getPlayerList() {
        return [...this.players.values()];
    }

    start_game() {

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

        return lobby;
    }

    joinLobby(lobbyId, socket) {
        const lobby = this.lobbies.get(lobbyId);
        
        if (!lobby) return null;

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
            id = Math.floor(1000 + (Math.random * 9000));
        } while (this.lobbies.has(id));

        return id;
    }
}

module.exports = Lobby;
module.exports = LobbyManager;