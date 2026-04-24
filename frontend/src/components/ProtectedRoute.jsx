// src/components/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    if (!user) return <p>Not authenticated</p>;

    return children;
}