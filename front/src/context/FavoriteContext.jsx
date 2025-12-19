import React, { createContext, useContext, useEffect, useState } from "react";

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const token = localStorage.getItem("token");

    // ===============================
    // LOAD MY FAVORITES
    // ===============================
    useEffect(() => {
        if (!token) return;

        const loadFavorites = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/favorites/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (data.success && Array.isArray(data.favorites)) {
                    setFavorites(data.favorites);
                }
            } catch (err) {
                console.error("Load favorites error:", err);
            }
        };

        loadFavorites();
    }, [token]);

    // ===============================
    // TOGGLE FAVORITE
    // ===============================
    const toggleFavorite = async (listingId) => {
        if (!token || !listingId) return;

        const isFav = favorites.some((f) => {
            if (!f || !f.listing) return false;
            return f.listing._id === listingId;
        });

        const url = isFav
            ? `http://localhost:5000/api/favorites/${listingId}`
            : "http://localhost:5000/api/favorites";

        const options = {
            method: isFav ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        };

        if (!isFav) {
            options.body = JSON.stringify({ listingId });
        }

        const res = await fetch(url, options);

        // Already exists → resync
        if (res.status === 409) {
            const refresh = await fetch(
                "http://localhost:5000/api/favorites/me",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await refresh.json();
            if (data.success) setFavorites(data.favorites);
            return;
        }

        if (!res.ok) return;

        if (isFav) {
            setFavorites((prev) =>
                prev.filter((f) => f?.listing?._id !== listingId)
            );
        } else {
            const data = await res.json();
            if (data.success && data.favorite) {
                setFavorites((prev) => [...prev, data.favorite]);
            }
        }
    };

    // ===============================
    // SAFE CHECK
    // ===============================
    const isFavorited = (listingId) =>
        favorites.some((f) => f?.listing?._id === listingId);

    return (
        <FavoriteContext.Provider
            value={{ favorites, toggleFavorite, isFavorited }}
        >
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoriteContext);
