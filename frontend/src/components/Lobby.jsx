import { useEffect, useState } from "react";
import QuizGame from "./Game";
import { socket } from "../socket";

export default function Lobby({ lobbyId }) {

    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {

        socket.on("lobby:update", (data) => {
            setPlayers(data.players);
            setHost(data.host);
        });

        socket.on("game:start", () => {
            setGameStarted(true);
        });

        return () => {
            socket.off("lobby:update");
            socket.off("game:start");
        };

    }, []);

    const startGame = () => {
        socket.emit("game:start", lobbyId);
    };

    const leaveLobby = () => {
        socket.emit("lobby:leave", lobbyId);
    };

    return (
        
        <div>
            

            {gameStarted
                ? <QuizGame lobbyId={lobbyId} />
                : (
                    <>
                        <h2>Lobby: {lobbyId}</h2>

                        <h3>Players:</h3>
                        <ul>
                        {players.map(p => (
                            <li key={p.socketId}>
                                {p.nickname}
                                {p.ready ? " ✅" : " ❌"}
                                {p.socketId === host && " (HOST)"}
                            </li>
                        ))}
                        </ul>

                        <button onClick={() => socket.emit("player:ready", lobbyId)}>
                            Toggle Ready
                        </button>

                        <button onClick={leaveLobby}> Leave lobby </button>

                        {socket.id === host && (
                            <button onClick={startGame}>
                                Start Game
                            </button>
                        )}
                    </>
                )
            }
        </div>
    );
}