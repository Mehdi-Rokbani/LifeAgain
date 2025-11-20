import Commande from "../models/Commande.js";
import Panier from "../models/Panier.js";

// 🔹 Créer une commande depuis le panier
export const createCommandeFromPanier = async (req, res) => {
    try {
        const { userId, billingDetails, paymentMethod, notes } = req.body;

        console.log("📦 Création commande pour user:", userId);

        // Récupère le panier actif
        const panier = await Panier.findOne({ user: userId, status: "active" })
            .populate("items.product");

        if (!panier || panier.items.length === 0) {
            return res.status(400).json({ message: "Le panier est vide" });
        }

        console.log("✅ Panier trouvé avec", panier.items.length, "articles");

        // Crée la commande
        const commande = await Commande.create({
            buyer: userId,
            items: panier.items.map(item => ({
                listing: item.product._id,
                quantity: item.quantity,
                price: item.price,
            })),
            billingDetails,
            paymentMethod: paymentMethod || "cash",
            totalPrice: panier.totalPrice,
            notes: notes || "",
            status: "pending",
        });

        console.log("✅ Commande créée:", commande.orderNumber);

        // ⭐ IMPORTANT : Marque le panier comme checked_out
        panier.status = "checked_out";
        await panier.save();

        console.log("✅ Panier marqué comme checked_out");

        // Populate la commande pour la réponse
        const populatedCommande = await Commande.findById(commande._id)
            .populate("buyer", "username email")
            .populate("items.listing");

        res.status(201).json({
            message: "Commande créée avec succès",
            commande: populatedCommande,
        });

    } catch (err) {
        console.error("❌ Erreur création commande:", err);
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Récupérer toutes les commandes d'un utilisateur
export const getCommandesByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const commandes = await Commande.find({ buyer: userId })
            .populate("items.listing")
            .sort({ createdAt: -1 });

        res.json(commandes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Récupérer une commande par ID
export const getCommandeById = async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id)
            .populate("buyer", "username email")
            .populate("items.listing");

        if (!commande) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        res.json(commande);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Mettre à jour le statut d'une commande
export const updateCommandeStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const commande = await Commande.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("items.listing");

        if (!commande) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        res.json({ message: "Statut mis à jour", commande });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Récupérer toutes les commandes (admin)
export const getAllCommandes = async (req, res) => {
    try {
        const commandes = await Commande.find()
            .populate("buyer", "username email")
            .populate("items.listing")
            .sort({ createdAt: -1 });

        res.json(commandes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};