
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useSingup = () => {
    const [Error, setError] = useState(null);
    const [Loading, setLoading] = useState(false);

    const Navigate = useNavigate();

    const signup = async ({ username, email, password, confirmPassword, role }) => {
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        console.log(email, password, role);
        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role }),
        });

        const json = await response.json();

        if (!response.ok) {
            setLoading(false);
            setError(json.message);
            return;
        }



        setLoading(false);
        Navigate("/login");
    };

    return { signup, Loading, Error };
};
