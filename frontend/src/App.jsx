import './App.css';
// import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {

  const makeLobby = () => {
    socket.emit("create room");
  }

  const joinLobby = () => {
    var lobbyCode;
    socket.emit("join room", lobbyCode);
  }

  return (
    <>
      
      <button onClick={makeLobby}>Lobby létrehozása</button>

      <input type="number" name="Lobby code" id="lobby_code" />

      <button onClick={joinLobby}></button>
      
    </>
  )
}

export default App
