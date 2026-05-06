import { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../socket";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    // Függvény kézi üzenetekhez (pl. "Sikeres mentés")
    const showAlert = (message, type = "error") => {
        setAlert({ message, type });
        // 5 másodperc után magától eltűnik
        setTimeout(() => setAlert(null), 5000);
    };

    useEffect(() => {
        // Szerver oldali hibaüzenetek figyelése
        const handleError = (msg) => {
            showAlert(msg, "error");
        };

        socket.on("lobby:error", handleError);
        return () => socket.off("lobby:error", handleError);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alert && (
                <div className={`global-alert-overlay ${alert.type}`}>
                    <div className="alert-card">
                        <div className="alert-icon">{alert.type === "error" ? "⚠️" : "ℹ"}</div>
                        <p>{alert.message}</p>
                        <button onClick={() => setAlert(null)}>OK</button>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);