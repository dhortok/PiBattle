import { useState } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function Home() {

    const { user } = useAuth();
    const { showAlert } = useAlert();

    const [input, setInput] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const createLobby = () => {
        socket.emit("lobby:create", { name });
    };

    const joinLobby = () => {
        socket.emit("lobby:join", {
            lobbyCode: input,
            name
        });
    };

    const handleRankedJoin = () => {
        if (!user) {
            showAlert("Be kell jelentkezned a Ranked módhoz!", "error");
            return;
        }
        setLoading(true);
        // A szerver oldalon a 'ranked:join' esemény hívja meg a joinRanked függvényt
        socket.emit("ranked:join");
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Home Screen</h1>
                <p>Matek PvP - készen állsz?</p>
            </header>

            <div className="home-grid">
                <section className="card ranked-section">
                    <h3>🏆 Ranked mód</h3>
                    <p>Mérkőzz meg hasonló tudású játékosokkal!</p>
                    <button className="btn btn-primary"
                        onClick={handleRankedJoin}
                        disabled={loading}
                        >
                        {loading ? "Keresés..." : "Játék keresése"}
                </button>
                </section>

                <section className="card private-section">
                    <h3>🔒 Privát szoba</h3>
                    <div className="input-group">
                        {!user && (
                        <input className="lobby-input" type="text"
                            placeholder="Adj meg ideiglenes nevet"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                localStorage.setItem("playerName", e.target.value);
                            }}
                        />
                        )}

                        <button className="btn btn-secondary" onClick={createLobby}>
                        Szoba létrehozása
                        </button>

                        <div className="divider">vagy</div>

                        <input placeholder="Lobby ID" className="lobby-input"  type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value.toUpperCase())}
                        />

                        <button className="btn btn-outline" onClick={joinLobby}>
                        Csatlakozás a szobához
                        </button>
                    </div>
                </section>

            </div>


        </div>
        
    );
}