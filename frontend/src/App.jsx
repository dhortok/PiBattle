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
        const token = localStorage.getItem("token");

        connectSocket(token);

        socket.on("lobby:created", setLobbyId);
        socket.on("lobby:joined", setLobbyId);
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
            <div style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                {user ? (
                    <>
                        <b>USER:</b> {user.username}
                        <button onClick={() => {
                            localStorage.removeItem("token");
                            socket.disconnect();
                            window.location.reload();
                        }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setAuthMode("login")}>
                            Login
                        </button>
                        <button onClick={() => setAuthMode("register")}>
                            Register
                        </button>
                        <span style={{ marginLeft: 10 }}>
                            (Guest mód)
                        </span>
                    </>
                )}
            </div>

            {!lobbyId
                ? <Home setLobbyId={setLobbyId} />
                : <Lobby lobbyId={lobbyId} />
            }
        </div>
    );
}

export default App;