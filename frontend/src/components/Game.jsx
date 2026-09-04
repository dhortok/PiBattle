import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";

export default function QuizGame({ lobbyId, onReturnToLobby }) {
    const [gameState, setGameState] = useState("waiting");
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(null);
    const [scores, setScores] = useState([]);
    const [prevScores, setPrevScores] = useState([]);
    const [endTime, setEndTime] = useState(null);
    const [podiumStep, setPodiumStep] = useState(0);
    const [progress, setProgress] = useState(100);
    const { user } = useAuth();
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const [timeLeft, setTimeLeft] = useState(0);
    const [maxTime, setMaxTime] = useState(10000);

    useEffect(() => {
        const timer = setInterval(() => {
            if (endTime && gameState === "question") {
                const remaining = Math.max(0, endTime - Date.now());
                // A progress kiszámítása a teljes idő alapján
                const percentage = (remaining / maxTime) * 100;
                setProgress(percentage);
                setTimeLeft(remaining);
                if (remaining === 0) setTimeLeft(0);
            }
        }, 50);
        return () => clearInterval(timer);
    }, [endTime, gameState, maxTime]);

    useEffect(() => {
        const handleQuestion = (data) => {
            console.log("KÉRDÉS ÉRKEZETT:", data); // Nézd meg, mi van benne!
            setGameState("question");
            setQuestion(data.question);
            setAnswers(data.answers);
            setMaxTime(data.maxTime);
            setEndTime(Date.now() + data.maxTime);
            setSelected(null);
            setCorrect(null);
            setShowLeaderboard(false);
        };

        const handleResult = (data) => {
            console.log(data);
            setGameState("result");
            setCorrect(data.correct);
            setPrevScores([...scores]);
            setScores(data.scores);

            setTimeout(() => {
                setShowLeaderboard(true);
            }, 2000);
        };

        const handleEnd = (data) => {
            setGameState("end");
            setScores(data);
            setTimeout(() => setPodiumStep(1), 1000); // 3. hely
            setTimeout(() => setPodiumStep(2), 2200); // 2. hely
            setTimeout(() => setPodiumStep(3), 3400); // 1. hely
        };

        socket.on("game:question", handleQuestion);
        socket.on("game:result", handleResult);
        socket.on("game:end", handleEnd);

        return () => {
            socket.off("game:question", handleQuestion);
            socket.off("game:result", handleResult);
            socket.off("game:end", handleEnd);
        };
    }, [scores]);

    const sendAnswer = (index) => {
        console.log("VÁLASZOLT: ", index);
        if (selected !== null || timeLeft <= 0) return;
        setSelected(index);
        socket.emit("game:answer", { lobbyId, answer: index });
    };

    
    const returnLobby = () => {
        if (onReturnToLobby) onReturnToLobby();
    };


    const getButtonClass = (index) => {
        let classes = "answer-btn";
        if (gameState === "question") {
            if (selected === index) classes += " selected";
        } else if (gameState === "result") {
            if (index === correct) {
                classes += " correct"; // Zöld
            } else if (selected === index) {
                classes += " wrong"; // Piros
            } else {
                classes += " dimmed"; // Halványított nem választott opciók
            }
        }
        return classes;
    }



    return (
        <div className="game-layout">
            {(gameState === "question" || gameState === "result") && (
                <div className="quiz-container">
                    
                    {/* Ranglista panel - Becsúszik jobbról */}
                    <div className={`leaderboard-panel ${showLeaderboard ? "slide-in" : ""}`}>
                        {gameState === "result" && (
                            <div className="result-view">
                                <h2>{selected === correct ? "Helyes válasz! 🎉" : selected === null ? "Lejárt az idő! ⏰" : "Sajnos rossz... 😢"}</h2>
                                <div className="leaderboard-container">
                                    <h3>Ranglista</h3>
                                    <div className="leaderboard-scroll">
                                    {scores.slice(0, 5).map((p, i) => {
                                        const prevPlayer = prevScores.find(prevP => prevP.socketId === p.socketId);
                                        
                                        const oldScore = prevPlayer ? prevPlayer.score : 0;
                                        const diff = p.score - oldScore;

                                        return (
                                            <div key={p.socketId || i} className={`score-row ${p.socketId === socket.id ? 'is-me' : ''}`}>
                                                <span className={`score-pos ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>#{i + 1}</span>
                                                <span className="score-name">{p.name}</span>
                                                <span className="score-point">{p.score}</span>
                                                <span className={`score-diff ${diff > 0 ? "up" : ""}`}>{diff > 0 ? `+${diff}` : "-"}</span>
                                            </div>
                                        );
                                    })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="question-view">
                        {gameState == "question" && (
                        <div className="timer-track"><div className="timer-bar" style={{ width: `${progress}%` }} /></div>
                        )}
                        <h2 className="question-text">{question}</h2>
                        <div className="answers-grid">
                            {answers.map((a, i) => (
                                <button 
                                    key={i} 
                                    className={getButtonClass(i)}
                                    onClick={() => sendAnswer(i)}
                                    disabled={selected !== null}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                </div>
            )}

            {gameState === "end" && (
                <div className="end-view">
                    <h1>Vége a játéknak!</h1>
                    <div className="podium">
                        <div className={`podium-box silver ${podiumStep >= 2 ? 'show' : ''}`}>
                            <div className="name">{scores[1]?.name}</div>
                            <div className="bar" style={{height: '60%'}}>2</div>
                        </div>
                        <div className={`podium-box gold ${podiumStep >= 3 ? 'show' : ''}`}>
                            <div className="name">{scores[0]?.name}</div>
                            <div className="bar" style={{height: '100%'}}>1</div>
                        </div>
                        <div className={`podium-box bronze ${podiumStep >= 1 ? 'show' : ''}`}>
                            <div className="name">{scores[2]?.name}</div>
                            <div className="bar" style={{height: '40%'}}>3</div>
                        </div>
                    </div>
                    <div className="xp-box">
                        {user ? `XP szerzve: +${scores.find(p => p.socketId === socket.id)?.xp}` : "XP-t csak bejelentkezve kaphatsz!"}
                    </div>
                    <button className="btn btn-primary" onClick={returnLobby}>Vissza a Lobbyba</button>
                </div>
            )}
        </div>
    );
}