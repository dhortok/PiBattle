// src/pages/Register.jsx
import { useState } from "react";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [msg, setMsg] = useState("");

    const handleRegister = async () => {
        const res = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name })
        });

        const data = await res.json();

        if (!res.ok) {
            return setMsg(data.message || "Error");
        }

        setMsg("Sikeres regisztráció! Jelentkezz be.");
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>

            <input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
            />

            <input
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />

            {msg && <p>{msg}</p>}

            <button onClick={handleRegister}>
                Register
            </button>
        </div>
    );
}