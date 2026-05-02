// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { connectSocket } from "../socket";

export default function Login({onBack}) {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        const res = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            return setError(data.message || "Login error");
        }

        login(data.token, data.user);
        connectSocket(data.token);
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>

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

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button onClick={handleLogin}>
                Login
            </button>
            <button onClick={onBack}>
                Home
            </button>
        </div>
    );
}