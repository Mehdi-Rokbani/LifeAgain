// src/services/commandeService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/commandes";

class CommandeService {
    async createCommandeFromPanier(billingDetails, paymentMethod, notes = "") {
        const token = localStorage.getItem("token");

        const res = await axios.post(
            API_URL,
            {
                billingDetails,
                paymentMethod,
                notes,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return res.data;
    }

    async getCommandesByUser(userId) {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return res.data;
    }

    async getCommandeById(commandeId) {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/${commandeId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return res.data;
    }
}

export default new CommandeService();
