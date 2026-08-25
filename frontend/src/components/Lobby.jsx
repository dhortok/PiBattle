import { useEffect, useState } from "react";
import QuizGame from "./Game";
import { socket } from "../socket";
import { useAlert } from "../context/AlertContext";
import {categories} from "../../../common/categories";

export default function Lobby({ lobbyId }) {
    const categoryArray = Object.entries(categories);

    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState(null);
    const [showSettings, setShowSettings] = useState(false); // Popup állapota
    const [isRanked, setIsRanked] = useState(false); // Ezt a szervernek küldenie kell az update-ben
    const [isRankReady, setIsRankReady] = useState(false); // Ezt a szervernek küldenie kell az update-ben
    const [gameStarted, setGameStarted] = useState(false);
    const [settings, setSettings] = useState({
        maxPlayer: 5,
        rounds: 5,
        maxQuestionTime: 30000,
        category: "geom"
    });

    useEffect(() => {
        const handleUpdate = (data) => {
            console.log(data);
            setPlayers(data.players);
            setHost(data.host);
            setIsRanked(data.isRanked || false);
            if (data.settings) setSettings(data.settings);
        };

        const handleStart = () => setGameStarted(true);

        const handleRankReady = () => setIsRankReady(true);

        socket.on("lobby:update", handleUpdate);
        socket.on("game:start", handleStart);
        socket.on("rank:ready", handleRankReady);

        return () => {
            socket.off("lobby:update", handleUpdate);
            socket.off("game:start", handleStart);
        };
    }, []);

    const { showAlert } = useAlert();

    const startGame = () => socket.emit("game:start", lobbyId);
    const leaveLobby = () => socket.emit("lobby:leave", lobbyId);

    // Visszatérés a lobby nézetbe
    const handleGameEnd = () => setGameStarted(false);

    const isHost = socket.id === host;

    // Másolás vágólapra
    const copyLobbyId = () => {
        navigator.clipboard.writeText(lobbyId);
        showAlert("Lobby ID másolva!", "info");
    };

    if (gameStarted) return (
        <QuizGame 
            lobbyId={lobbyId} 
            onReturnToLobby={() => setGameStarted(false)}
        />
    );
    return (
        <div className="lobby-container">
            <div className="lobby-header">
                {isRanked ? (
                    <h2 style={{ color: "#ffd700" }}>🛡️ Ranked Lobby - Ellenfelek keresése...</h2>
                ) : (
                    <h2>Szoba: <span className="lobby-id" onClick={copyLobbyId} title="Másolás">{lobbyId} 📋</span></h2>
                )}
            </div>

            <div className="lobby-content">
                {/* BAL OLDAL: Játékosok */}
                <div className="card players-card">
                    <h3>👥 Játékosok ({players.length}/{settings.maxPlayer})</h3>
                    <ul className="player-list">
                        {players.map(p => (
                            <li key={p.socketId} className={p.socketId === host ? "is-host" : ""}>
                                <span>{p.nickname} {p.socketId === host && "👑"}</span>
                                {!isRanked && (
                                    <span className={p.ready ? "status-ready" : "status-waiting"}>
                                    {p.ready ? " ✅" : " ❌"}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>

                    {isRanked && (
                        <p style={{ fontStyle: "italic", marginTop: 10 }}>
                            {!isRankReady ? ("Várakozás játékosokra") : ("A lobby megtelt, a játék hamarosan elindul!")}
                        </p>
                        
                    )}

                    <div className="lobby-actions">
                        {!isRanked ? (
                        <button className="btn btn-primary" onClick={() => socket.emit("player:ready", lobbyId)}>Kész vagyok</button>
                        ) : (null)}
                        <button className="btn btn-danger" onClick={() => socket.emit("lobby:leave", lobbyId)}>Kilépés</button>
                    </div>
                </div>

                {/* JOBB OLDAL: Játékszabályok nézete */}
                {!isRanked ? (
                <div className="card settings-view-card">
                    <h3>⚙️ Játékszabályok</h3>
                    <div className="settings-info">
                        <p><strong>Körök száma:</strong> {settings.rounds}</p>
                        <p><strong>Időkeret:</strong> {settings.maxQuestionTime / 1000} másodperc</p>
                        <p><strong>Max játékos:</strong> {settings.maxPlayer}</p>
                        <p><strong>Kategória:</strong> {categories[settings.category]}</p>
                    </div>
                    {isHost && (
                        <>
                            <button className="btn btn-outline" onClick={() => setShowSettings(true)}>Beállítások módosítása</button>
                            <button className="btn btn-success" onClick={() => socket.emit("game:start", lobbyId)}>Játék indítása</button>
                        </>
                    )}
                </div>) : (null)}
            </div>

            {/* POPUP MODAL (Csak a Hostnak) */}
            {showSettings && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Játék Beállítások</h3>
                        <label>Max Játékos: {settings.maxPlayer}</label>
                        <input type="range" min="2" max="20" value={settings.maxPlayer} 
                               onChange={e => setSettings({...settings, maxPlayer: Number(e.target.value)})} />
                        
                        <label>Körök: {settings.rounds}</label>
                        <input type="range" min="3" max="20" value={settings.rounds} 
                               onChange={e => setSettings({...settings, rounds: Number(e.target.value)})} />

                        <label>Idő (ms):</label>
                        <input type="number" value={settings.maxQuestionTime} 
                               onChange={e => setSettings({...settings, maxQuestionTime: Number(e.target.value)})} />

                        <label>Kategória:</label>
                        {
                            categoryArray.map(c => (
                                <>
                                <input 
                                    type="radio" 
                                    name="category" 
                                    id={c[0]} 
                                    value={c[1]}
                                    checked={(c[0] === settings.category) ? "checked" : null}
                                    onChange={_ => setSettings({...settings, category: c[0]})}
                                />
                                <label htmlFor={c[0]}>{c[1]}</label>
                                </>
                            ))
                        }

                        {/*Random kategória majd később!*/}
                        

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={() => {
                                socket.emit("lobby:updateSettings", { lobbyId, settings });
                                setShowSettings(false);
                            }}>Mentés</button>
                            <button className="btn btn-outline" onClick={() => setShowSettings(false)}>Mégse</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}