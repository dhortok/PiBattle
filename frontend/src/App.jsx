import './App.css';
// import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {

  const makeLobby = () => {
    socket.emit("create room");
  }

  const joinLobby = () => {
    var lobbyCode = document.getElementById("lobbyID");
    socket.emit("join room", lobbyCode);
  }

  socket.on("lobbyUpdate", (lobby) => {
    console.log("lobby updated");
  });

  return (
    <>
      
      <button onClick={makeLobby}>Lobby létrehozása</button>

      <input type="number" name="lobby_code" id="lobbyId" />

      <button onClick={joinLobby}></button>
      
    </>
  )
}

export default App
