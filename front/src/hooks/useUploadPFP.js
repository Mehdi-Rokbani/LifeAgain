import { useState } from "react";
import axios from "axios";
export const useUploadPFP = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const uploadPFP = async (file) => {
        if (!file) {
            setError("No file selected");
            return null;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError("Please select an image file");
            return null;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                setError("No authentication token found");
                return null;
            }

            const form = new FormData();
            form.append("picture", file);

            console.log("Uploading file:", file.name, file.size); // Debug log

            const res = await axios.post(
                "http://localhost:5000/api/user/upload-picture",
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 30000, // 30 second timeout
                }
            );

            console.log("Upload response:", res.data); // Debug log
            return res.data.user;

        } catch (err) {
            console.log("PFP UPLOAD ERROR:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || "Upload failed. Please try again.";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { uploadPFP, loading, error };
};