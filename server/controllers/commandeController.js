// controllers/commandeController.js
import Panier from "../models/Panier.js";
import Commande from "../models/Commande.js";
import Listing from "../models/Listing.js";
import Address from "../models/Address.js";


// controllers/commandeController.js
export const createCommandeFromPanier = async (req, res) => {
    try {
        const userId = req.user.id;
        const { billingDetails, paymentMethod } = req.body;

        // 1️⃣ Validate address
        if (
            !billingDetails?.streetAddress ||
            !billingDetails?.city ||
            !billingDetails?.zipCode ||
            !billingDetails?.country
        ) {
            return res.status(400).json({ message: "Invalid delivery address" });
        }

        // 2️⃣ Get panier
        const panier = await Panier.findOne({
            user: userId,
            status: "active",
        }).populate("items.product");

        if (!panier || panier.items.length === 0) {
            return res.status(400).json({ message: "Panier vide" });
        }

        // 3️⃣ Compute total safely
        let totalPrice = 0;

        for (const item of panier.items) {
            if (item.product.status !== "available") {
                return res.status(400).json({
                    message: `Produit déjà vendu: ${item.product.title}`,
                });
            }

            const productPrice = Number(item.product.price);

            if (isNaN(productPrice)) {
                return res.status(400).json({
                    message: `Invalid price for ${item.product.title}`,
                });
            }

            totalPrice += productPrice;
        }

        // 4️⃣ Create commande
        const commande = await Commande.create({
            buyer: userId,
            items: panier.items.map((i) => ({
                listing: i.product._id,
                quantity: 1,
                price: Number(i.product.price),
            })),
            billingDetails,
            paymentMethod,
            totalPrice,
            status: "pending",
        });

        // 5️⃣ Lock products
        for (const item of panier.items) {
            await Listing.findByIdAndUpdate(item.product._id, {
                status: "sold",
            });
        }

        // 6️⃣ Close panier
        panier.status = "checked_out";
        await panier.save();

        res.status(201).json({ message: "Commande créée", commande });

    } catch (err) {
        console.error("CREATE COMMANDE ERROR:", err);
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
// cancel command
export const cancelCommande = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const commande = await Commande.findById(req.params.id)
            .populate("items.listing")
            .session(session);

        if (!commande) {
            throw new Error("Commande introuvable");
        }

        if (commande.status !== "pending") {
            throw new Error("Commande déjà traitée");
        }

        // Re-open listings
        for (const item of commande.items) {
            await Listing.findByIdAndUpdate(
                item.listing._id,
                { status: "available" },
                { session }
            );
        }

        commande.status = "cancelled";
        await commande.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ message: "Commande annulée et produits réouverts" });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: err.message });
    }
};
