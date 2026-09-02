export default function PlayerList({ players, host, maxPlayer, isRanked, isRankReady, lobbyId, socket }) {
    return (
        <div className="card players-card">
            <h3>👥 Játékosok ({players.length}/{maxPlayer})</h3>
            <ul className="player-list">
            {players.map((p) => (
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
                {!isRankReady ? "Várakozás játékosokra" : "A lobby megtelt, a játék hamarosan elindul!"}
            </p>
            )}
    
            <div className="lobby-actions">
            {!isRanked && (
                <button className="btn btn-primary" onClick={() => socket.emit("player:ready", lobbyId)}>
                Kész vagyok
                </button>
            )}
            <button className="btn btn-danger" onClick={() => socket.emit("lobby:leave", lobbyId)}>
                Kilépés
            </button>
            </div>
        </div>
    );
  }