import axios from 'axios';

const API_URL = 'http://localhost:5000/api/listings';

class ListingService {
    // Récupérer tous les produits
    async getAllListings() {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    // Récupérer un produit par ID
    async getListingById(id) {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    // Rechercher des produits
    async searchListings(params) {
        try {
            const response = await axios.get(`${API_URL}/search`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new ListingService();