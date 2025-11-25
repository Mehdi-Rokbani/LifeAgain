import { useState } from "react";

export const useUpdateProfile = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const token = localStorage.getItem("token");

    const updateProfile = async (updates) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch("http://localhost:5000/api/user/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            const json = await res.json();

            if (!res.ok) {
                setError(json.message);
                setLoading(false);
                return;
            }

            // Update localStorage
            localStorage.setItem("user", JSON.stringify(json.user));

            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError("Something went wrong.", err);
        }

        setLoading(false);
    };

    return { updateProfile, loading, error, success };
};
