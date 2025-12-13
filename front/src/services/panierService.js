import axios from "axios";

const API_URL = "http://localhost:5000/api/panier";

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

class PanierService {
    // 🔹 Get my active panier
    async getMyPanier() {
        const res = await axios.get(`${API_URL}/me`, {
            headers: authHeader(),
        });
        return res.data;
    }

    // 🔹 Add product (used → quantity = 1)
    async addProduct(productId) {
        const res = await axios.post(
            `${API_URL}/add`,
            { productId },
            { headers: authHeader() }
        );
        return res.data;
    }

    // 🔹 Remove product
    async removeProduct(productId) {
        const res = await axios.delete(
            `${API_URL}/product/${productId}`,
            { headers: authHeader() }
        );
        return res.data;
    }
}

export default new PanierService();
