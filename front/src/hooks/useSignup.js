import { useAuthContext } from "./useAuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useSingup = () => {
    const [Error, setError] = useState(null);
    const [Loading, setLoading] = useState(false);
    const { dispatch } = useAuthContext();
    const Navigate = useNavigate();

    const signup = async (username, email, password, confirmPassword) => {
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const json = await response.json();

        if (!response.ok) {
            setLoading(false);
            setError(json.message);
            return;
        }

        localStorage.setItem("user", JSON.stringify(json.user));
        localStorage.setItem("token", json.token);

        dispatch({ type: "LOGIN", payload: json.user });

        setLoading(false);
        Navigate("/");
    };

    return { signup, Loading, Error };
};
