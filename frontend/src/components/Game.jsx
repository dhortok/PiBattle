import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function QuizGame({ lobbyId }) {

    const [gameState, setGameState] = useState("waiting");
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(null);
    const [scores, setScores] = useState({});

    useEffect(() => {

        socket.on("game:question", (data) => {
            setGameState("question");
            setQuestion(data.question);
            setAnswers(data.answers);
            setSelected(null);
            setCorrect(null);
        });

        socket.on("game:result", (data) => {
            setGameState("result");
            setCorrect(data.correct);
            setScores(data.scores);
        });

        socket.on("game:end", (data) => {
            setGameState("end");
            setScores(data.scores);
        });

        return () => {
            socket.off("game:question");
            socket.off("game:result");
            socket.off("game:end");
        };

    }, []);

    const sendAnswer = (index) => {
        if (selected !== null) return;
        setSelected(index);

        console.log(index);

        socket.emit("game:answer", {
            lobbyId,
            answer: index
        });
    };

    return (
        <div style={{ padding: 20 }}>

            {/* KÉRDÉSEK */}
            {gameState === "question" && (
                <>
                    <h2>{question}</h2>

                    {answers.map((a, i) => (
                        <button
                            key={i}
                            onClick={() => sendAnswer(i)}
                            style={{
                                display: "block",
                                margin: "10px 0",
                                padding: "10px",
                                background:
                                    selected === i ? "#ccc" : "#fff",
                                color: "#000"
                            }}
                        >
                            {a}
                        </button>
                    ))}
                </>
            )}

            {/* KÉRDÉS EREDMÉNY */}
            {gameState === "result" && (
                <>
                    <h2>Correct answer: {answers[correct]}</h2>

                    <h3>Scores:</h3>
                    <ul>
                        {Object.entries(scores).map(([id, score]) => (
                            <li key={id}>
                                {id}: {score}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* JÁTÉK VÉGE */}
            {gameState === "end" && (
                <>
                    <h2>Game Over</h2>

                    <h3>Final Scores:</h3>
                    <ul>
                        {Object.entries(scores).map(([id, score]) => (
                            <li key={id}>
                                {id}: {score}
                            </li>
                        ))}
                    </ul>
                </>
            )}

        </div>
    );
}