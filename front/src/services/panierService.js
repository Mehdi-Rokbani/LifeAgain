import axios from 'axios';

const API_URL = 'http://localhost:5000/api/panier';

class PanierService {
    // Récupérer le panier d'un utilisateur
    async getPanierByUser(userId) {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    // Ajouter un produit au panier
    async addProductToPanier(userId, productId) {
        try {
            const response = await axios.get(
                `${API_URL}/user/${userId}/add-test/${productId}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    // Retirer un produit du panier
    async removeProductFromPanier(userId, productId) {
        try {
            const response = await axios.delete(
                `${API_URL}/user/${userId}/product/${productId}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    // Mettre à jour la quantité
    async updateQuantity(userId, productId, quantity) {
        try {
            const response = await axios.put(
                `${API_URL}/user/${userId}/product/${productId}`,
                { quantity }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new PanierService();