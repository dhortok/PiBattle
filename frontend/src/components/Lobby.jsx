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
        const handleUpdate = (data) => {
            setPlayers(data.players);
            setHost(data.host);
            if (data.settings) setSettings(data.settings);
        };

        const handleStart = () => setGameStarted(true);

        socket.on("lobby:update", handleUpdate);
        socket.on("game:start", handleStart);

        return () => {
            socket.off("lobby:update", handleUpdate);
            socket.off("game:start", handleStart);
        };
    }, []);

    const startGame = () => socket.emit("game:start", lobbyId);
    const leaveLobby = () => socket.emit("lobby:leave", lobbyId);

    // Visszatérés a lobby nézetbe
    const handleGameEnd = () => setGameStarted(false);

    return (
        <div style={{ padding: 20 }}>
            {gameStarted ? (
                <QuizGame lobbyId={lobbyId} onReturnToLobby={handleGameEnd} />
            ) : (
                <>
                    <h2>Lobby: {lobbyId}</h2>

                    {socket.id === host && (
                        <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 20 }}>
                            <h3>Game Settings</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
                                <label>Max Players: {settings.maxPlayer}</label>
                                <input type="range" value={settings.maxPlayer} min="2" max="100"
                                    onChange={e => setSettings({ ...settings, maxPlayer: Number(e.target.value) })} />

                                <label>Rounds: {settings.rounds}</label>
                                <input type="range" value={settings.rounds} min="3" max="20"
                                    onChange={e => setSettings({ ...settings, rounds: Number(e.target.value) })} />

                                <label>Time (ms):</label>
                                <input type="number" value={settings.maxQuestionTime}
                                    onChange={e => setSettings({ ...settings, maxQuestionTime: Number(e.target.value) })} />

                                <button onClick={() => socket.emit("lobby:updateSettings", { lobbyId, settings })}>
                                    Apply Settings
                                </button>
                            </div>
                        </div>
                    )}

                    <h3>Players:</h3>
                    <ul>
                        {players.map(p => (
                            <li key={p.socketId}>
                                {p.nickname} {p.ready ? " ✅" : " ❌"} {p.socketId === host && " (HOST)"}
                            </li>
                        ))}
                    </ul>

                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <button onClick={() => socket.emit("player:ready", lobbyId)}>Toggle Ready</button>
                        <button onClick={leaveLobby} style={{ background: "red", color: "white" }}>Leave lobby</button>
                        {socket.id === host && (
                            <button onClick={startGame} style={{ background: "green", color: "white" }}>Start Game</button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}