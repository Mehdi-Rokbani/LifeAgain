import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const json = await response.json();
            console.log("🔍 what am I getting:", json);

            if (!response.ok) {
                setError(json.message || "Login failed");
                setLoading(false);
                return;
            }

            // Save user and token
            localStorage.setItem("user", JSON.stringify(json.user));
            localStorage.setItem("token", json.token);

            // Update context
            dispatch({ type: "LOGIN", payload: json.user });

            setLoading(false);
            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error or server unavailable");
            setLoading(false);
        }
    };

    return { login, loading, error };
};
