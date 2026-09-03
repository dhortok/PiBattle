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
    const [isRanked, setIsRanked] = useState(false); // Ezt a szervernek küldenie kell az update-ben
    const [isRankReady, setIsRankReady] = useState(false); // Ezt a szervernek küldenie kell az update-ben
    const [gameStarted, setGameStarted] = useState(false);
    const [settings, setSettings] = useState({
        maxPlayer: 5,
        rounds: 5,
        maxQuestionTime: 30000,
        category: "geom"
    });

    console.log(lobbyId);

    useEffect(() => {
        socket.emit("lobby:join", {
            lobbyCode: lobbyId,
            name: ""
        });

        const handleUpdate = (data) => {
            console.log(data);
            setPlayers(data.players);
            setHost(data.host);
            setIsRanked(data.isRanked || false);
            if (data.settings) setSettings(data.settings);
        };

        const handleStart = () => setGameStarted(true);

        const handleRankReady = () => setIsRankReady(true);

        const handleLobbyError = () => navigate("/");

        socket.on("lobby:update", handleUpdate);
        socket.on("game:start", handleStart);
        socket.on("rank:ready", handleRankReady);
        socket.on("lobby:error", handleLobbyError);

        return () => {
            socket.off("lobby:update", handleUpdate);
            socket.off("game:start", handleStart);
        };
    }, [lobbyId]);

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

    const handleSaveSettings = (newSettings) => {
        setSettings(newSettings);
        socket.emit("lobby:updateSettings", { lobbyId, settings: newSettings });
        setShowSettings(false);
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
                <PlayerList
                    players={players}
                    host={host}
                    maxPlayer={settings.maxPlayer}
                    isRanked={isRanked}
                    isRankReady={isRankReady}
                    lobbyId={lobbyId}
                    socket={socket}
                />

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
                <SettingsModal
                initialSettings={settings}
                onSave={handleSaveSettings}
                onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}