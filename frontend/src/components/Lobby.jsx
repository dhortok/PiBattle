import { useEffect, useState } from "react";
import QuizGame from "./Game";
import { socket } from "../socket";
import { useAlert } from "../context/AlertContext";
import {categories} from "../../../common/categories";
import PlayerList from "./PlayerList";
import SettingsModal from "./SettingsModal";
import { useParams, useNavigate } from "react-router-dom";


export default function Lobby() {
    const { id: lobbyId } = useParams();

    const navigate = useNavigate();

    const [userName, setUserName] = useState(() => localStorage.getItem("playerName") || "");
    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState(null);
    const [showSettings, setShowSettings] = useState(false); // Popup állapota
    const [gameStarted, setGameStarted] = useState(false);
    const [canStart, setCanStart] = useState(false);
    const [settings, setSettings] = useState({
        maxPlayer: 5,
        rounds: 5,
        maxQuestionTime: 30000,
        category: "geom",
        gameMode: "default"
    });

    useEffect(() => {
        socket.emit("lobby:join", {
            lobbyCode: lobbyId,
            name: ""
        });

        const handleUpdate = (data) => {
            console.log(data);
            setPlayers(data.players);
            setHost(data.host);
            if (data.canStart) setCanStart(data.canStart);
            if (data.settings) setSettings(data.settings);
        };

        const handleStart = () => setGameStarted(true);

        // Visszatérés a lobby nézetbe
        const handleGameEnd = () => setGameStarted(false);

        const handleLobbyError = () => navigate("/");

        socket.on("lobby:update", handleUpdate);
        socket.on("game:start", handleStart);
        socket.on("lobby:returned", handleGameEnd);
        socket.on("lobby:error", handleLobbyError);

        return () => {
            socket.off("lobby:update", handleUpdate);
            socket.off("game:start", handleStart);
        };
    }, [lobbyId]);

    const { showAlert } = useAlert();

    const startGame = () => socket.emit("game:start", lobbyId);
    const leaveLobby = () => socket.emit("lobby:leave", lobbyId);

    const isHost = socket.id === host;

    // Másolás vágólapra
    const copyLobbyId = () => {
        navigator.clipboard.writeText(lobbyId);
        showAlert("Lobby ID másolva!", "info");
    };

    const handleSaveSettings = (newSettings) => {
        if (newSettings.rounds < 3 || newSettings.rounds > 20) {
            showAlert("Nem érvényes körszámot adtál meg! A körök száma minimum 3, maximum 20!");
        } else if (newSettings.maxQuestionTime < 10000 || newSettings.maxQuestionTime > 90000) {
            showAlert("Nem érvényes körszámot adtál meg! A válaszadás idő minimum 10mp, maximum 90mp!");
        } else {
            setSettings(newSettings);
            socket.emit("lobby:updateSettings", { lobbyId, settings: newSettings });
            setShowSettings(false);
        }
      };

    if (gameStarted) return (
        <QuizGame lobbyId={lobbyId} />
    );
    return (
        <div className="lobby-container">
            <div className="lobby-header">
                <h2>Szoba: <span className="lobby-id" onClick={copyLobbyId} title="Másolás">{lobbyId} 📋</span></h2>
                <h2>Játékmenet: <strong className={settings.gameMode === "extrem" ? "extrem" : settings.gameMode === "survival" ? "survival" : ""}>
                    {settings.gameMode === "default" ? "Klasszikus" : settings.gameMode === "extrem" ? "EXTRÉM 🔥" : "Túlélő 💖"}
                </strong></h2>
                <p><strong>{settings.gameMode !== "survival" ? settings.rounds : "∞"}</strong><br />kör</p>
                <p><strong>{settings.maxQuestionTime / 1000}</strong> mp<br />válaszadásra</p>
                <p>Max. <strong>{settings.maxPlayer}</strong><br />játékos</p>
                <p><strong>{settings.category === "random" ? "🔀 RANDOM" : categories[settings.category]}</strong><br />kérdések</p>
            </div>

            
            {/* Játékosok */}
            <PlayerList
                players={players}
                host={host}
                maxPlayer={settings.maxPlayer}
            />

            <div className="lobby-actions">
                <button className="btn btn-danger" onClick={() => socket.emit("lobby:leave", lobbyId)}>
                    Kilépés
                </button>
                {isHost && ( 
                    <button className="btn btn-outline" onClick={() => setShowSettings(true)}>Beállítások módosítása</button> 
                )}             
                <button className="btn btn-primary" onClick={() => socket.emit("player:ready", lobbyId)}>
                    Kész vagyok
                </button>
                {isHost && ( 
                    <button 
                        className="btn btn-success" 
                        title={canStart ? "" : "Nem minden játékos áll készen."} 
                        disabled={!canStart} 
                        onClick={() => socket.emit("game:start", lobbyId)}
                    >
                        Játék indítása
                    </button> 
                )}
            </div>

            {/* POPUP MODAL (Csak a Hostnak) */}
            {showSettings && (
                <SettingsModal
                initialSettings={settings}
                onSave={handleSaveSettings}
                onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}