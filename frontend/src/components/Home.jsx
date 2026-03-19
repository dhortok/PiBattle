import { useState } from "react";
import { socket } from "../socket";

export default function Home({ setLobbyId }) {

    const [input, setInput] = useState("");

    const createLobby = () => {
        socket.emit("lobby:create");
    };

    const joinLobby = () => {
        socket.emit("lobby:join", input);
    };

    return (
        <div>
            <h1>Lobby</h1>

            <button onClick={createLobby}>
                Create Lobby
            </button>

            <div>
                <input
                    placeholder="Lobby ID"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                />
                <button onClick={joinLobby}>
                    Join Lobby
                </button>
            </div>
        </div>
    );
}