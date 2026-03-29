import './App.css';
import { useEffect, useState } from "react";
import { socket } from "./socket";
import Home from "./components/Home";
import Lobby from "./components/Lobby";

function App() {

    const [lobbyId, setLobbyId] = useState(null);

    useEffect(() => {

        socket.on("lobby:update", (_, roomId) => {
            // opcionális, ha backend küldi
        });

        // ha create után akarod visszakapni az ID-t:
        socket.on("lobby:created", (id) => {
            setLobbyId(id);
        });

        socket.on("lobby:joined", (id) => {
            setLobbyId(id);
        });

        return () => {
            socket.off("lobby:created");
            socket.off("lobby:joined");
        };

    }, []);

    return (
        <div>
            {!lobbyId
                ? <Home setLobbyId={setLobbyId} />
                : <Lobby lobbyId={lobbyId} />
            }
            
        </div>
    );
}

export default App;
