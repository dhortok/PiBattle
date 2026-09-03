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

// MÁR AZ INICIALIZÁLÁSKOR ADJUK MEG A SESSIONID-T!
export const socket = io("http://localhost:3000", {
    autoConnect: false,
    auth: {
        sessionId: getSessionId()
    }
});

export const connectSocket = (token) => {
    socket.auth = {
        token,
        sessionId: getSessionId()
    };

    if (!socket.connected) {
        socket.connect();
    }
};