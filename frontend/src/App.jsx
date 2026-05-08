import { useState, useEffect } from "react";
import { socket, connectSocket } from "./socket";
import {xp_to_levels} from "../../common/level"
import {rankCalculator} from "../../common/rank"
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";

function App() {
    const { user, updateUser, logout } = useAuth();

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

    useEffect(() => {
        socket.on("user:update_xp", (newXp) => {
            if (user) {
                updateUser({ xp: newXp }); 
                console.log("XP frissítve:", newXp);
            }
        });
        return () => {
            socket.off("user:update_xp");
        };
    }, [user, updateUser]);

    // AUTH MODUL
    if (authMode === "login") {
        return <Login onBack={() => setAuthMode(null)} />;
    }

    if (authMode === "register") {
        return <Register onBack={() => setAuthMode(null)} />;
    }

    const stats = user ? xp_to_levels(user.xp || 0) : null;
    const rankStats = user ? rankCalculator(user.rank_xp || 0) : null;

    return (
        <div>
            <nav className="navbar">
                <div className="nav-auth">
                    {user ? (
                        <div className="user-profile-container">
                            <div className="user-info-block">
                                {/* Felső sor: Név és Szint jelvény */}
                                <div className="user-header-row">
                                    <span className="username">👤 {user.username}</span>
                                    <span className="level-badge">Lvl {stats.level}</span>
                                    <span className={`rank-badge rank-${rankStats.category}`}>
                                        {rankStats.rankName}
                                    </span>
                                </div>

                                {/* XP progress bar és szöveg */}
                                <div className="xp-container">
                                    <div className="xp-bar-bg">
                                        <div 
                                            className="xp-bar-fill" 
                                            style={{ width: `${stats.progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <small className="xp-text">
                                        {stats.xpInCurrentLevel} / {stats.nextLevelAt} XP
                                    </small>
                                </div>
                            </div>
                            
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