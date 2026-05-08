import { useState } from "react";
import { useAlert } from "../context/AlertContext"; // Importáljuk az Alertet

export default function Register({ onBack }) {
    const { showAlert } = useAlert();
    const [formData, setFormData] = useState({ email: "", password: "", username: "" });
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                showAlert(data.message || "Hiba a regisztráció során!", "error");
            } else {
                // Sikeres visszajelzés
                showAlert("Sikeres regisztráció! Most már bejelentkezhetsz.", "info");
                onBack(); // Automatikusan visszavisz a Login/Home oldalra
            }
        } catch (err) {
            showAlert("Nem sikerült elérni a szervert!", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card auth-card">
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                />

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Processing..." : "Create Account"}
                </button>
            </form>
            
            <button className="btn-nav" onClick={onBack} style={{ width: "100%" }}>
                Back to Home
            </button>
        </div>
    );
}