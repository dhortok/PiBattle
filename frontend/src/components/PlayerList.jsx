export default function PlayerList({ players, host, maxPlayer, isRanked, isRankReady}) {
    return (
        <div className="players-card">
            <h3>👥 Játékosok ({players.length}/{maxPlayer})</h3>
            <ul className="player-list">
            {players.map((p) => (
                <li key={p.socketId} className={`${p.socketId === host ? "is-host" : ""} ${!p.isOnline ? "not-online" : ""}`}>
                <span>{p.socketId === host && "👑"} {p.nickname}</span>
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
        </div>
    );
  }