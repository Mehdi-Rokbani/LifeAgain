import axios from "axios";
import React from "react";

const API_URL = "http://localhost:5000/api/favorites";

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

class FavoriteService {
    add(listingId) {
        return axios.post(
            API_URL,
            { listingId },
            { headers: authHeader() }
        );
    }

    remove(listingId) {
        return axios.delete(`${API_URL}/${listingId}`, {
            headers: authHeader(),
        });
    }

    getMyFavorites() {
        return axios.get(`${API_URL}/me`, {
            headers: authHeader(),
        });
    }

    check(listingId) {
        return axios.get(`${API_URL}/check/${listingId}`, {
            headers: authHeader(),
        });
    }
}

export default new FavoriteService();
