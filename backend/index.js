const express = require('express');
const socketio = require('socket.io');
const app = express();
const PORT = process.env.PORT || 3000;

let lobbies = new Map();


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
    console.log('New client connected');

    socket.on('create room', () => {
        let lobbyCode = Math.floor(1000 + (Math.random * 9000));
        
        lobbies.set(lobbyCode, []);
        socket.join(lobbyCode);

        console.log(`Created room with lobby code: ${lobbyCode}`);
    });

    socket.on('join room', (lobbyCode) => {
        if (lobbies.has(lobbyCode)) {
            socket.join(lobbyCode);
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});