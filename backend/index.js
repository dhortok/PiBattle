const express = require('express');
const socketio = require('socket.io');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

const LobbyManager = require("./src/lobby");
const DBManager = require('./src/db');

const lobbyManager = new LobbyManager();
const dbManager = new DBManager();

// Serve static files
app.use(express.static('public'));

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
    const token = socket.handshake.auth?.token;

    if (!token) {
        socket.user = null; // guest
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // { userId }
        next();
    } catch (err) {
        socket.user = null;
        next();
    }
});

// Handle client connections
io.on('connection', (socket) => {
    console.log('New client connected: ', socket.id);

    socket.on('lobby:create', () => {
        
        const lobby = lobbyManager.createLobby(socket);

        console.log(lobby);

        socket.join(lobby.id);
        socket.emit("lobby:created", lobby.id);
        io.to(lobby.id).emit('lobby:update', {players: lobby.getPlayerList(), host: lobby.host});

        console.log(`Created lobby with code: ${lobby.id}`);
    });

    socket.on('lobby:join', (lobbyCode) => {

        console.log(lobbyCode);

        const lobby = lobbyManager.joinLobby(lobbyCode, socket);

        console.log(lobby);

        if (!lobby) {
            socket.emit("lobby:error", "The lobby was not found, or it was full!");
            return;
        }

        socket.join(lobbyCode);
        socket.emit("lobby:joined", lobby.id);
        io.to(lobby.id).emit('lobby:update', {players: lobby.getPlayerList(), host: lobby.host});

        console.log(`Joined lobby with code: ${lobbyCode}`);
    });

    // Handle Game starting 
    socket.on('game:start', (lobbyId) => {
        
        const lobby = lobbyManager.lobbies.get(lobbyId);

        if (!lobby) return;
        if (lobby.host !== socket.id) return;

        io.to(lobbyId).emit("game:start");

        setTimeout(() => {
            lobby.startGame(io);
        }, 200);

        console.log("START GAME LOBBY:", lobbyId);
    });

    socket.on("game:answer", ({ lobbyId, answer }) => {

        const lobby = lobbyManager.lobbies.get(lobbyId);
        console.log(lobby);

        if (!lobby || ! lobby.game) return;

        lobby.game.submitAnswer(socket.id, answer, io);
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


app.use(express.json());

app.post("/api/register", async (req, res) => {
    const { email, password, username } = req.body;

    // validate input
    if(!email || !password || !username) {
        return res.status(400).send("Missing required field!");
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await dbManager.query(
        "INSERT INTO users (email, password, username) VALUES ($1,$2,$3) RETURNING id",
        [email, hashed, username]
    );

    res.status(201).send("User registered successfully!");
});


app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await dbManager.getUserByEmail(email);

    if (!user) return res.status(401).send("No user");

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).send("Wrong password");

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET
    );

    res.json({ token });
});