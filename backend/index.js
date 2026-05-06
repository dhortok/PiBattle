const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

const LobbyManager = require("./src/lobby");
const DBManager = require('./src/db');

const lobbyManager = new LobbyManager();
const dbManager = new DBManager();

// Webapp beállítások
app.use(cors({
    origin: "http://localhost:5173", // React port
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
app.use(express.static('public'));
app.use(express.json());


// Create HTTP server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    dbManager.test();
});

// Initialize Socket.io
const io = socketio(server, {
    cors: {
        origin: "http://localhost:5173", // React port
        methods: ["GET", "POST"]
    }
});

// middleware
io.use((socket, next) => {
    const { token, sessionId } = socket.handshake.auth || {};

    // JWT
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
        } catch {
            socket.user = null;
        }
    } else {
        socket.user = null;
    }

    // SESSION ID
    if (sessionId) {
        socket.sessionId = sessionId;
    } else {
        socket.sessionId = uuidv4();
    }

    next();
});

// Handle client connections
io.on('connection', (socket) => {
    console.log('New client connected: ', socket.id, "; \nsessionId: ", socket.sessionId);

    socket.on('lobby:create', ({ name }) => {
        console.log(socket.user);
        const lobby = lobbyManager.createLobby(socket, name, dbManager);

        console.log(lobby);

        socket.join(lobby.id);
        socket.emit("lobby:created", lobby.id);

        setTimeout(() => {
            io.to(lobby.id).emit("lobby:update", {
                players: lobby.getPlayerList(),
                host: lobby.host
            });
        }, 250);

        console.log(`Created lobby with code: ${lobby.id}`);
    });

    socket.on('lobby:join', ({ lobbyCode, name }) => {
        console.log(lobbyCode)

        const lobby = lobbyManager.joinLobby(lobbyCode, socket, name);

        console.log(lobby);

        if (!lobby) {
            socket.emit("lobby:error", "The lobby was not found, or it was full!");
            return;
        }

        socket.join(lobbyCode);
        socket.emit("lobby:joined", lobby.id);

        setTimeout(() => {
            io.to(lobbyCode).emit("lobby:update", {
                players: lobby.getPlayerList(),
                host: lobby.host
            });
        }, 250);

        console.log(`Joined lobby with code: ${lobbyCode}`);
    });

    socket.on("lobby:updateSettings", ({lobbyId, settings}) => {
        const lobby = lobbyManager.lobbies.get(lobbyId);
        if (!lobby) return;
        if (lobby.host !== socket.id) return;

        if (!LobbyManager.validateSettings(settings)) return;

        lobby.settings = {
            ...lobby.settings,
            ...settings
        }

        io.to(lobby.id).emit('lobby:update', {
            players: lobby.getPlayerList(), 
            host: lobby.host,
            settings: lobby.settings
        });
    });

    socket.on("lobby:leave", (lobbyId) => {
        const lobby = lobbyManager.lobbies.get(lobbyId);
        if (!lobby) return;

        console.log(lobby);

        lobby.removePlayer(socket);

        socket.leave(lobbyId);

        socket.emit("lobby:left");
    
        setTimeout(() => {
            io.to(lobbyId).emit("lobby:update", {
                players: lobby.getPlayerList(),
                host: lobby.host
            });
        }, 250);

    });


    // READY SYSTEM
    socket.on("player:ready", (lobbyId) => {
        const lobby = lobbyManager.lobbies.get(lobbyId);
        if (!lobby) return;
    
        const player = lobby.players.get(socket.id);
        if (!player) return;
    
        player.ready = !player.ready;
    
        setTimeout(() => {
            io.to(lobbyId).emit("lobby:update", {
                players: lobby.getPlayerList(),
                host: lobby.host
            });
        }, 250);
    });


    // Handle Game starting 
    socket.on('game:start', (lobbyId) => {
        const lobby = lobbyManager.lobbies.get(lobbyId);
    
        if (!lobby) return;
        if (lobby.host !== socket.id) return;
        if (lobby.state !== "waiting") return;
        if (!lobby.canStart()) return;
    
        io.to(lobbyId).emit("game:start");
    
        setTimeout(() => {
            lobby.startGame(io);
        }, 250);
    });

    socket.on("game:answer", ({ lobbyId, answer }) => {

        const lobby = lobbyManager.lobbies.get(lobbyId);

        if (!lobby || ! lobby.game) return;

        lobby.game.submitAnswer(socket.id, answer, io);
    });

    socket.on("lobby:reconnect", (lobbyId) => {
        const lobby = lobbyManager.lobbies.get(lobbyId);
        if (!lobby) return;
    
        const player = [...lobby.players.values()].find(p =>
            (p.userId && p.userId === socket.user?.userId) ||
            (p.sessionId && p.sessionId === socket.sessionId)
        );
    
        if (!player) return;
    
        // 🔁 socketId frissítés
        lobby.players.delete(player.socketId);
    
        player.socketId = socket.id;
        lobby.players.set(socket.id, player);
    
        socket.join(lobbyId);
    
        socket.emit("lobby:joined", lobbyId);

        setTimeout(() => {
            io.to(lobbyId).emit("lobby:update", {
                players: lobby.getPlayerList(),
                host: lobby.host
            });
        }, 250);
   
    });

    // Keresés indítása a Ranked rendszerben
    socket.on('ranked:join', async () => {
        // Csak bejelentkezett felhasználók játszhatnak rankedet
        if (!socket.user) {
            return socket.emit("lobby:error", "Be kell jelentkezned a Ranked játékhoz!");
        }

        try {
            const lobby = await lobbyManager.joinRanked(socket, dbManager, io);

            if (lobby) {
                socket.emit("lobby:joined", lobby.id);
                setTimeout(() => {
                    io.to(lobby.id).emit('lobby:update', {
                        players: lobby.getPlayerList(),
                        host: null, // Ranked esetén nincs host
                        isRanked: true
                    });
                }, 250);

                if (lobby.players.size === lobby.settings.maxPlayer) {
                    io.to(lobby.id).emit("rank:ready");

                    setTimeout(() => {
                        io.to(lobby.id).emit("game:start");
    
                        setTimeout(() => {
                            lobby.startGame(io);
                        }, 250);
                    }, 10000);
                }
            } else {
                socket.emit("lobby:error", "Hiba történt a meccskeresés során.");
            }
        } catch (err) {
            console.error(err);
            socket.emit("lobby:error", "Szerverhiba a matchmaking alatt.");
        }
    });

    socket.on('ranked:leave', () => {
        lobbyManager.leaveLobby(socket);
        socket.emit('lobby:left');
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        
        const lobby = lobbyManager.leaveLobby(socket);

        if (!lobby) return;

        io.to(lobby.id).emit("lobby:update", {
            players: lobby.getPlayerList(),
            host: lobby.host
        });

        console.log('Client disconnected');
    });
});


/* API VÉGPONTOK */
// REGISTRATION API
app.post("/api/register", async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
        const result = await dbManager.query(
            "INSERT INTO users (email, password_hash, username) VALUES ($1,$2,$3) RETURNING user_id",
            [email, hashed, username]
        );

        res.status(201).json({
            message: "User registered"
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "User already exists"
        });
    }
});

// LOGIN API
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }
    
    const user = await dbManager.getUserByEmail(email);

    if (!user) {
        return res.status(401).json({ message: "No user" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
        return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        token,
        user: {
            id: user.user_id,
            email: user.email,
            username: user.username
        }
    });
});

// USER API
app.get("/api/me", async (req, res) => {
    const auth = req.headers.authorization;

    if (!auth) return res.status(401).json({ message: "No token" });

    const token = auth.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await dbManager.query(
            "SELECT user_id, email, username FROM users WHERE user_id = $1",
            [decoded.userId]
        );

        res.json({ user: user.rows[0] });

    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
});