import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Lobby({ lobbyId }) {

    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState(null);

    useEffect(() => {

        socket.on("lobby:update", (data) => {
            setPlayers(data.players);
            setHost(data.host);
        });

        socket.on("game:start", () => {
            alert("Game started!");
        });

        return () => {
            socket.off("lobby:update");
            socket.off("game:start");
        };

    }, []);

    const startGame = () => {
        socket.emit("game:start", lobbyId);
    };

    return (
        <div>
            <h2>Lobby: {lobbyId}</h2>

            <h3>Players:</h3>
            <ul>
                {players.map(p => (
                    <li key={p.id}>
                        {p.name} {p.id === host && "(HOST)"}
                    </li>
                ))}
            </ul>

            {socket.id === host && (
                <button onClick={startGame}>
                    Start Game
                </button>
            )}
        </div>
    );
}