import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function QuizGame({ lobbyId }) {

    const [gameState, setGameState] = useState("waiting");
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(null);
    const [scores, setScores] = useState({});

    const [timeLeft, setTimeLeft] = useState(0);
    const [maxTime, setMaxTime] = useState(10000);

    // TIMER
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

    // SOCKET EVENTS
    useEffect(() => {

        socket.on("game:question", (data) => {
            console.log("DATA: ", data);

            setGameState("question");
            setQuestion(data.question);
            setAnswers(data.answers);
            setSelected(null);
            setCorrect(null);

            console.log(data.time);

            setMaxTime(data.maxTime);
            setTimeLeft(data.maxTime);
        });

        socket.on("game:result", (data) => {
            setGameState("result");
            setCorrect(data.correct);
            setScores(data.scores);
        });

        socket.on("game:end", (data) => {
            console.log("GAME END DATA:", data);
        
            setGameState("end");
            setScores(data || {});
        });

        return () => {
            socket.off("game:question");
            socket.off("game:result");
            socket.off("game:end");
        };

    }, []);

    const sendAnswer = (index) => {
        if (selected !== null) return;
        if (timeLeft <= 0) return;

        setSelected(index);

        socket.emit("game:answer", {
            lobbyId,
            answer: index
        });
    };

    // PROGRESS %
    const progress = (timeLeft / maxTime) * 100;
    console.log({ timeLeft, maxTime, progress });

    // SCORE RENDEZÉS
    const sortedScores = Object.entries(scores)
        .sort((a, b) => b[1].score - a[1].score);

    const leaveLobby = () => {
        socket.emit("lobby:leave");
    };
    
    const returnLobby = () => {
        socket.emit();
    }

    return (
        <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>

            {/* PROGRESS BAR */}
            {gameState === "question" && (
                <div style={{
                    height: 10,
                    background: "#eee",
                    marginBottom: 20,
                    borderRadius: 5,
                    overflow: "hidden"
                }}>
                    <div style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: progress > 50
                            ? "#4caf50"
                            : progress > 20
                                ? "#ff9800"
                                : "#f44336",
                        transition: "width 0.1s linear"
                    }} />
                </div>
            )}

            {/* KÉRDÉS */}
            {gameState === "question" && (
                <>
                    <h2>{question}</h2>

                    {answers.map((a, i) => {

                        let bg = "#fff";

                        if (selected === i) bg = "#ccc";

                        if (gameState === "result") {
                            if (i === correct) bg = "#4caf50";
                            else if (selected === i) bg = "#f44336";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => sendAnswer(i)}
                                disabled={timeLeft <= 0 || selected !== null}
                                style={{
                                    display: "block",
                                    margin: "10px 0",
                                    padding: "12px",
                                    width: "100%",
                                    background: bg,
                                    color: "#000",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    transition: "0.2s"
                                }}
                            >
                                {a}
                            </button>
                        );
                    })}
                </>
            )}

            {/* RESULT */}
            {gameState === "result" && (
                <>
                    <h2>Correct: {answers[correct]}</h2>

                    <h3>Leaderboard:</h3>
                    <ul>
                    {sortedScores.map(([id, data], index) => (
                        <li key={id}>
                            #{index + 1} — {data.name}: {data.score}
                        </li>
                    ))}
                    </ul>
                </>
            )}

            {/* END */}
            {gameState === "end" && (
                <>
                    <h2>🏆 Game Over</h2>

                    <h3>Final Ranking:</h3>
                    <ul>
                        {sortedScores.map(([id, data], index) => (
                            <li key={id}>
                                #{index + 1} — {data.name}: {data.score} ({data.xp})
                            </li>
                        ))}
                    </ul>

                    <button onClick={leaveLobby}>Leave lobby</button>
                    <button onClick={returnLobby}>Return to lobby</button>
                </>
            )}

        </div>
    );
}