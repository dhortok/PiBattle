import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
    autoConnect: false
});

export const connectSocket = (token) => {
    socket.auth = token ? { token } : {};
    socket.connect();
};