import { useState } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";

export default function Home({ setLobbyId }) {

    const { user } = useAuth();

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
            alert("Be kell jelentkezned a Ranked módhoz!");
            return;
        }
        setLoading(true);
        // A szerver oldalon a 'ranked:join' esemény hívja meg a joinRanked függvényt
        socket.emit("ranked:join");
    };

    return (
        <div className="container">
            <h1>Home screen</h1>

            <h2>Ranked mód</h2>
            <p>Mérkőzz meg hasonló tudású játékosokkal!</p>
            <button className="btn"
                    onClick={handleRankedJoin}
                    disabled={loading}
                    >
                    {loading ? "Keresés..." : "Játék keresése"}
            </button>
            
            <hr />
            
            <h2>Privát szoba</h2>

            {!user && (
                <input type="text"
                    placeholder="Adj meg ideiglenes nevet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            )}

            <button className="btn" onClick={createLobby}>
                Szoba létrehozása
            </button>

            <div>
                <input type="text"
                    placeholder="Lobby ID"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                />

                <button className="btn" onClick={joinLobby}>
                    Csatlakozás a szobához
                </button>
            </div>
        </div>
    );
}