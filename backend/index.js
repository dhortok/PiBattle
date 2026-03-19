const express = require('express');
const socketio = require('socket.io');
const app = express();
const PORT = process.env.PORT || 3000;

const LobbyManager = require("./src/lobby")

const lobbyManager = new LobbyManager();

// Serve static files
app.use(express.static('public'));

// Create HTTP server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Initialize Socket.io
const io = socketio(server, {
    cors: {
        origin: "http://localhost:5173", // React port
        methods: ["GET", "POST"]
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

        const lobby = lobbyManager.joinLobby(lobbyCode, socket);

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

        lobby.state = "playing";

        io.to(lobby.id).emit("game:start");

        console.log('Game started');
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