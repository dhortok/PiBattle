import { io } from "socket.io-client";

// sessionId generálás
const sessionId =
    localStorage.getItem("sessionId") || crypto.randomUUID();

localStorage.setItem("sessionId", sessionId);

export const socket = io("http://localhost:3000", {
    autoConnect: false
});

export const connectSocket = (token) => {
    socket.auth = {
        token,
        sessionId
    };

    socket.connect();
};