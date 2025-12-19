const API_URL = "http://localhost:5000/api/commandes";

const createCommandeFromPanier = async (billingDetails, paymentMethod) => {
    const res = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ billingDetails, paymentMethod }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

const getMyCommandes = async () => {
    const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.json();
};

const getSellerCommandes = async () => {
    const res = await fetch(`${API_URL}/seller`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.json();
};

export default {
    createCommandeFromPanier,
    getMyCommandes,
    getSellerCommandes,
};
