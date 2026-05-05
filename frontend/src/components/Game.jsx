import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function QuizGame({ lobbyId, onReturnToLobby }) {
    const [gameState, setGameState] = useState("waiting");
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(null);
    const [scores, setScores] = useState({});

    const [timeLeft, setTimeLeft] = useState(0);
    const [maxTime, setMaxTime] = useState(10000);

    useEffect(() => {
        if (gameState !== "question") return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 100;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [gameState]);

    useEffect(() => {
        const handleQuestion = (data) => {
            console.log("KÉRDÉS ÉRKEZETT:", data); // Nézd meg, mi van benne!
            setGameState("question");
            setQuestion(data.question);
            setAnswers(data.answers);
            setSelected(null);
            setCorrect(null);
            setMaxTime(data.maxTime);
            setTimeLeft(data.maxTime);
        };

        const handleResult = (data) => {
            setGameState("result");
            setCorrect(data.correct);
            setScores(data.scores);
        };

        const handleEnd = (data) => {
            setGameState("end");
            setScores(data || {});
        };

        socket.on("game:question", handleQuestion);
        socket.on("game:result", handleResult);
        socket.on("game:end", handleEnd);

        return () => {
            socket.off("game:question", handleQuestion);
            socket.off("game:result", handleResult);
            socket.off("game:end", handleEnd);
        };
    }, []);

    const sendAnswer = (index) => {
        if (selected !== null || timeLeft <= 0) return;
        setSelected(index);
        socket.emit("game:answer", { lobbyId, answer: index });
    };

    const progress = Math.max(0, (timeLeft / maxTime) * 100);
    const sortedScores = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);

    const leaveLobby = () => socket.emit("lobby:leave");
    
    // JAVÍTVA: Üres socket.emit helyett a Lobby komponens értesítése
    const returnLobby = () => {
        if (onReturnToLobby) onReturnToLobby();
    };

    return (
        <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
            {gameState === "question" && (
                <div style={{ height: 10, background: "#eee", marginBottom: 20, borderRadius: 5, overflow: "hidden" }}>
                    <div style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: progress > 50 ? "#4caf50" : progress > 20 ? "#ff9800" : "#f44336",
                        transition: "width 0.1s linear"
                    }} />
                </div>
            )}

            {gameState === "question" && (
                <>
                    <h2>{question}</h2>
                    {answers?.map((a, i) => {
                        let bg = "#fff";
                        if (selected === i) bg = "#ccc";
                        return (
                            <button key={i} onClick={() => sendAnswer(i)}>
                                {a}
                            </button>
                        );
                    })}
                </>
            )}

            {gameState === "result" && (
                <>
                    <h2>Helyes válasz: {answers[correct]}</h2>
                    <h3>Ranglista:</h3>
                    <ul>
                        {sortedScores.map(([id, data], index) => (
                            <li key={id}>#{index + 1} — {data.name}: {data.score}</li>
                        ))}
                    </ul>
                </>
            )}

            {gameState === "end" && (
                <>
                    <h2>🏆 Game Over</h2>
                    <h3>Végeredmény:</h3>
                    <ul>
                        {sortedScores.map(([id, data], index) => (
                            <li key={id}>#{index + 1} — {data.name}: {data.score} (XP: +{data.xp})</li>
                        ))}
                    </ul>
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <button onClick={leaveLobby} style={{ background: "red", color: "white" }}>Kilépés a szobából</button>
                        <button onClick={returnLobby} style={{ background: "blue", color: "white" }}>Vissza a váróba</button>
                    </div>
                </>
            )}
        </div>
    );
}