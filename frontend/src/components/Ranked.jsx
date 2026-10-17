import {useEffect, useState, useRef} from "react";
import QuizGame from "./Game";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";

import {rankCalculator} from "../../../common/rank";

export default function Ranked() {

    const navigate = useNavigate();

    const [opponentFound, setOpponentFound] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    
    const [isRankReady, setIsRankReady] = useState(false);
    const [player, setPlayer] = useState({});
    const [opponent, setOpponent] = useState({});
    const [rankStats, setRankStats] = useState({});

    const lobbyId = useRef(null);

    useEffect(() => {
        socket.emit("ranked:join");

        const handleRankedUpdate = (data) => {
            setPlayer(data.players[0]);
            setOpponent(data.players[1]);
            setOpponentFound(data.players.length === 2 ? true : false);

            console.log(data.rankNum);

            setRankStats(rankCalculator(data.rankNum));
        };

        const handleRankReady = () => setIsRankReady(true);

        const handleStart = (data) => {
            lobbyId.current = data;
            setGameStarted(true)
        };

        const handleLobbyError = () => navigate("/");
        

        socket.on("ranked:update", handleRankedUpdate);
        socket.on("rank:ready", handleRankReady);

        socket.on("game:start", handleStart);

        socket.on("lobby:error", handleLobbyError);

        return () => {
            socket.off("ranked:update", handleRankedUpdate);
            socket.off("game:start", handleStart);
        }
    }, [])

    if (gameStarted) return (
        <QuizGame lobbyId={lobbyId.current} />
    )
    return (
        <div className="ranked-container">
            <div className="ranked-header">
                <h2>RANKED MÓD</h2>

                <h2><span className={`rank-badge rank-${rankStats.category}`}>{rankStats.rankName}</span></h2>
            </div>

            <div className="ranked-main">
                <div className="ranked-player"> {/*Saját player*/}
                    <p className="ranked-player-card">{player.nickname}</p>
                </div>

                {opponentFound ? ( /* Ellenfél (ha van)*/
                    <div className="ranked-player">
                        <p className="ranked-player-card">{opponent.nickname}</p>
                    </div>
                ) : (
                    <p>Ellenfél keresése!</p>
                )}

            </div>



            <button className="btn btn-danger" onClick={() => socket.emit("ranked:leave")}>
                Kilépés
            </button>

            
             
        </div>
    )
}