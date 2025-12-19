import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/notfound.css";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="notfound-wrapper">
            <div className="notfound-card">
                <div className="notfound-code">404</div>

                <h1 className="notfound-title">Page not found</h1>

                <p className="notfound-text">
                    The page you are looking for doesn’t exist or was moved.
                </p>

                <div className="notfound-actions">
                    <button
                        className="notfound-btn primary"
                        onClick={() => navigate("/")}
                    >
                        Go Home
                    </button>

                    <button
                        className="notfound-btn ghost"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </button>
                </div>
            </div>

            {/* Decorative background */}
            <div className="notfound-bg-circle one" />
            <div className="notfound-bg-circle two" />
        </div>
    );
}
