import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext"; // Importáljuk az Alertet
import { connectSocket } from "../socket";

export default function Login({ onBack }) {
    const { login } = useAuth();
    const { showAlert } = useAlert();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                // Globális hibaüzenet
                showAlert(data.message || "Invalid credentials!", "error");
            } else {
                login(data.token, data.user);
                connectSocket(data.token);
                // showAlert("Sikeres bejelen! Most már bejelentkezhetsz.", "info"); // MÉG NEM TUDOM, HOGY KELL-E
                onBack(); // Automatikusan visszavisz az előző oldalra
            }
        } catch (err) {
            showAlert("Server unreachable!", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card auth-card">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <button className="btn-nav" onClick={onBack} style={{ width: "100%" }}>
                Cancel
            </button>
        </div>
    );
}