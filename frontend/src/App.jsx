import { useState, useEffect } from "react";
import { socket, connectSocket } from "./socket";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";

function App() {
    const { user } = useAuth();

    const [lobbyId, setLobbyId] = useState(null);
    const [authMode, setAuthMode] = useState(null); // null | login | register

    useEffect(() => {
        socket.on("connect", () => {
            const savedLobby = localStorage.getItem("lobbyId");
    
            if (savedLobby) {
                socket.emit("lobby:reconnect", savedLobby);
            }
        });
    
        return () => {
            socket.off("connect");
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        connectSocket(token);

        socket.on("lobby:created", setLobbyId);
        socket.on("lobby:joined", (id) => {
            localStorage.setItem("lobbyId", id);
            setLobbyId(id);
        });
        socket.on("lobby:left", () => {
            localStorage.removeItem("lobbyId");
            setLobbyId(null);
        });

        return () => {
            socket.off("lobby:created");
            socket.off("lobby:joined");
        };
    }, []);

    // AUTH MODUL
    if (authMode === "login") {
        return <Login onBack={() => setAuthMode(null)} />;
    }

    if (authMode === "register") {
        return <Register onBack={() => setAuthMode(null)} />;
    }

    return (
        <div>
            <nav className="navbar">
                <div className="nav-logo">PiBattle</div>
                <div className="nav-auth">
                    {user ? (
                        <div className="user-info">
                            <span className="username">👤 {user.username}</span>
                            <button className="btn-nav-logout" onClick={() => {
                                logout();
                                socket.disconnect();
                            }}>Logout</button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <button className="btn-nav" onClick={() => setAuthMode("login")}>Login</button>
                            <button className="btn-nav btn-register" onClick={() => setAuthMode("register")}>Register</button>
                        </div>
                    )}
                </div>
            </nav>

            <main className="main-content">
            {!lobbyId
                ? <Home setLobbyId={setLobbyId} />
                : <Lobby lobbyId={lobbyId} />
            }
            </main>
        </div>
    );
}

export default App;