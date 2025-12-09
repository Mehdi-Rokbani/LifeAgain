import axios from 'axios';

const API_URL = 'http://localhost:5000/api/commandes';

class CommandeService {
    // Créer une commande depuis le panier
    async createCommandeFromPanier(userId, billingDetails, paymentMethod, notes = '') {
        try {
            const response = await axios.post(API_URL, {
                userId,
                billingDetails,
                paymentMethod,
                notes
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    // Récupérer les commandes d'un utilisateur
    async getCommandesByUser(userId) {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    // Récupérer une commande par ID
    async getCommandeById(commandeId) {
        try {
            const response = await axios.get(`${API_URL}/${commandeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new CommandeService();