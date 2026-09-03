const Game = require("./game");
const { v4: uuidv4 } = require("uuid");

// Általános lobby osztály
class Lobby {
    constructor(id, dbManager) {
        this.id = id;
        this.type = null;
        this.dbManager = dbManager;
        this.players = new Map();
        this.state = "waiting" // State: waiting, ingame
        this.game = null;
        this.settings = {
            maxPlayer: 5, // max játékosok száma
            rounds: 5, // körök száma
            maxQuestionTime: 30000, // max idő a kérdésre (ms)
            category: "geom" // Kérdés kategóriája
        }
    }

    async addPlayer(socket, name) {
        if (this.players.size >= this.settings.maxPlayer) return false;
        if (this.players.has(socket)) return false;

        let nickname;
    
        if (socket.user?.userId) {
            try {
                // Feltételezve, hogy a dbManager-nek van egy aszinkron metódusa
                const user = await this.dbManager.getUserById(socket.user.userId);
                nickname = user ? user.username : (name || "Unknown User");
            } catch (error) {
                console.error("DB hiba a lobby-ban:", error);
                nickname = name || "Guest"; // Fallback, ha elszáll a DB
            }
        } else {
            nickname = name || `Guest${Math.floor(Math.random() * 1000)}`;
        }
    
        this.players.set(socket.id, {
            socketId: socket.id,
            sessionId: socket.sessionId,
            userId: socket.user?.userId || null,
            nickname,
            ready: false
        });
    
        return true;
    }

    removePlayer(socket){
        this.players.delete(socket.id);
    }

    getPlayerList() {
        return [...this.players.values()];
    }

    canStart() {
        if (this.players.size < 1) return false;
    
        return [...this.players.values()].every(p => p.ready);
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


// A "BARÁTI" MÉRKŐZÉSEK LOBBYJA
class GeneralLobby extends Lobby {
    constructor(id, host, dbManager) {
        super(id, dbManager);
        this.type = "general";
        this.host = host;
    }


    removePlayer(socket) {
        super.removePlayer(socket);

        if (this.host === socket.id) {
            const next = this.players.keys().next().value;
            this.host = next || null;
        }
    }
}


// A RANGOS MÉRKŐZÉSEK LOBBYJA
class RankedLobby extends Lobby {
    constructor(id, dbManager) {
        super(id, dbManager);
        this.type = "ranked";
        this.rankNum = 0;
        this.settings = {
            ...this.settings,
            maxPlayer: 2, // max játékosok száma
            rounds: 10, // körök száma
            maxQuestionTime: 15000, // max idő a kérdésre (ms)
        }
    }
}



class LobbyManager {
    constructor() {
        this.lobbies = new Map();
        this.ranked = new Map();
    }

    createLobby(socket, name, dbManager) {
        const id = this.generateLobbyId();

        const lobby = new GeneralLobby(id, socket.id, dbManager);
        lobby.addPlayer(socket, name);

        this.lobbies.set(id, lobby);

        console.log(this.lobbies);

        return lobby;
    }

    joinLobby(lobbyId, socket, name) {
        const lobby = this.lobbies.get(lobbyId);
        
        if (!lobby) return null;

        if (lobby.state != "waiting") return null;

        if (!lobby.addPlayer(socket, name)) return null;

        return lobby;
    }

    leaveLobby(socket) {
        // Keresés a sima lobbyk között
        for (const lobby of this.lobbies.values()) {
            if (lobby.players.has(socket.id)) {
                lobby.removePlayer(socket);
                if (lobby.players.size === 0) this.lobbies.delete(lobby.id);
                return lobby;
            }
        }
        
        // Keresés a ranked lobbyk között
        for (const lobby of this.ranked.values()) {
            if (lobby.players.has(socket.id)) {
                lobby.removePlayer(socket);
                
                // Most egyelőre csak töröljük a lobbyt, ha kiürül.
                if (lobby.players.size === 0 || lobby.state === "waiting") {
                    this.ranked.delete(lobby.id);
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

    // VALIDATE SETTINGS
    static validateSettings(settings) {
        if (settings.maxPlayer < 2 || settings.maxPlayer > 100) return false;
        if (settings.rounds < 3 || settings.rounds > 20) return false;
        if (settings.maxQuestionTime < 10000 || settings.maxQuestionTime > 60000) return false;
        return true;
    }

    async joinRanked(socket, dbManager, io) {
        if (!socket.user) return false; // Csak bejelentkezett felhasználók

        const userRank = await dbManager.getRankById(socket.user.userId);
        if (userRank === null || userRank === undefined) return false;

        console.log(userRank);

        let matchFound = null;
        for (const lobby of this.ranked.values()) {
            if (lobby.state === "waiting" && lobby.players.size < lobby.settings.maxPlayer) {
                if((lobby.rankNum - userRank.rang) < 100) {
                    matchFound = lobby;
                    break;
                }
            }
        }
        
        console.log(matchFound);

        if (!matchFound) {
            const id = uuidv4();
            matchFound = new RankedLobby(id, dbManager);
            matchFound.rankNum = userRank.rang;
            this.ranked.set(id, matchFound);
        }

        matchFound.addPlayer(socket, socket.user.username);
        socket.join(matchFound.id);

        /*
        if (matchFound.players.size === matchFound.settings.maxPlayer) {
            console.log("Game is starting!");
            matchFound.state = "starting"; // Ne léphessen be más
            
            setTimeout(() => {
                io.to(matchFound.id).emit("game:start");
                
                setTimeout(() => {
                    matchFound.startGame(io);
                }, 4000); // 3 másodperc múlva ténylegesen elindul a Game osztály
                
            }, 1000);
        }
        */

        return matchFound;
    }

}

module.exports = LobbyManager;