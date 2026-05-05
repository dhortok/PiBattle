import { io } from "socket.io-client";

// sessionId lekérése vagy biztonságos generálása
const getSessionId = () => {
    let sid = localStorage.getItem("sessionId");
    if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem("sessionId", sid);
    }
    return sid;
};

export const socket = io("http://localhost:3000", {
    autoConnect: false
});

export const connectSocket = (token) => {
    // Ha már él a kapcsolat, bontsuk, mielőtt új auth adatokkal csatlakozunk
    if (socket.connected) {
        socket.disconnect();
    }

    socket.auth = {
        token,
        sessionId: getSessionId()
    };

    socket.connect();
};