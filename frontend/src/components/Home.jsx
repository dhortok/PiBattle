import { useState } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";

export default function Home({ setLobbyId }) {

    const { user } = useAuth();

    const [input, setInput] = useState("");
    const [name, setName] = useState("");

    const createLobby = () => {
        socket.emit("lobby:create", { name });
    };

    const joinLobby = () => {
        socket.emit("lobby:join", {
            lobbyCode: input,
            name
        });
    };

    return (
        <div>
            <h1>Lobby</h1>

            {!user && (
                <input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            )}

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