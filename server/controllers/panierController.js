import Panier from "../models/Panier.js";
import Listing from "../models/Listing.js";

// 🔹 1. Create panier for a user
export const createPanier = async (req, res) => {
    try {
        const { user } = req.body;

        const existing = await Panier.findOne({ user, status: "active" });
        if (existing) return res.json(existing);

        const panier = await Panier.create({ user, items: [] });
        res.status(201).json(panier);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 2. Get panier by user
export const getPanierByUser = async (req, res) => {
    try {
        const panier = await Panier.findOne({ user: req.params.userId, status: "active" })
            .populate("items.product");

        if (!panier) return res.json({ items: [], totalPrice: 0 });

        res.json(panier);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 3. Add product to panier
export const addProduct = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Log pour debug
        console.log("📦 BODY COMPLET:", JSON.stringify(req.body));
        console.log("📦 TYPE:", typeof req.body);
        
        // Récupère le productId de n'importe quelle manière
        const productId = req.body?.productId || req.query?.productId;
        
        if (!productId) {
            return res.status(400).json({ 
                message: "productId manquant",
                received: req.body 
            });
        }

        let panier = await Panier.findOne({ user: userId, status: "active" });
        if (!panier) {
            panier = await Panier.create({ user: userId, items: [] });
        }

        const product = await Listing.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Produit introuvable" });
        }

        const existingItem = panier.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            panier.items.push({
                product: productId,
                quantity: 1,
                price: product.price,
            });
        }

        await panier.save();
        
        const populated = await Panier.findById(panier._id).populate('items.product');
        res.json(populated);

    } catch (err) {
        console.error("❌ Erreur:", err);
        res.status(500).json({ message: err.message });
    }
};
// 🔹 4. Remove product
export const removeProduct = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const panier = await Panier.findOne({ user: userId, status: "active" });
        if (!panier) return res.status(404).json({ message: "Panier introuvable" });

        panier.items = panier.items.filter(
            item => item.product.toString() !== productId
        );

        await panier.save();

        // ✅ Ajoute le populate
        const populated = await Panier.findById(panier._id).populate('items.product');
        res.json(populated);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 5. Update quantity
export const updateQuantity = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const { quantity } = req.body;

        const panier = await Panier.findOne({ user: userId, status: "active" });
        if (!panier) return res.status(404).json({ message: "Panier introuvable" });

        const item = panier.items.find(
            i => i.product.toString() === productId
        );

        if (!item) return res.status(404).json({ message: "Produit pas dans le panier" });

        item.quantity = quantity;
        await panier.save();

        // ✅ Ajoute le populate avant de retourner
        const populated = await Panier.findById(panier._id).populate('items.product');
        res.json(populated);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};