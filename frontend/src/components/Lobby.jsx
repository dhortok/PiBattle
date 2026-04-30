import { useEffect, useState } from "react";
import QuizGame from "./Game";
import { socket } from "../socket";

export default function Lobby({ lobbyId }) {

    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [settings, setSettings] = useState({
        maxPlayer: 5,
        rounds: 5,
        maxQuestionTime: 30000
    });

    useEffect(() => {

        socket.on("lobby:update", (data) => {
            setPlayers(data.players);
            setHost(data.host);
        
            if (data.settings) {
                setSettings(data.settings);
            }
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

                        {socket.id === host && (
                            <div style={{ border: "1px solid #ccc", padding: 10 }}>
                                <h3>Game Settings</h3>

                                <label>Max Players:</label>
                                <input
                                    type="range"
                                    value={settings.maxPlayer}
                                    min="2"
                                    max="100"
                                    onChange={e => setSettings({
                                        ...settings,
                                        maxPlayer: Number(e.target.value)
                                    })}
                                />

                                <label>Rounds:</label>
                                <input
                                    type="range"
                                    value={settings.rounds}
                                    min="3"
                                    max="20"
                                    onChange={e => setSettings({
                                        ...settings,
                                        rounds: Number(e.target.value)
                                    })}
                                />

                                <label>Time (ms):</label>
                                <input
                                    type="number"
                                    value={settings.maxQuestionTime}
                                    onChange={e => setSettings({
                                        ...settings,
                                        maxQuestionTime: Number(e.target.value)
                                    })}
                                />

                                <button onClick={() => {
                                    socket.emit("lobby:updateSettings", {
                                        lobbyId,
                                        settings
                                    });
                                }}>
                                    Apply
                                </button>
                            </div>
                        )}

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