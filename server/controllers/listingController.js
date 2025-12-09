import Listing from "../models/Listing.js";

// 🔹 Créer un listing
export const createListing = async (req, res) => {
    try {
        const listing = await Listing.create(req.body);
        res.status(201).json(listing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Récupérer tous les listings
export const getAllListings = async (req, res) => {
    try {
        const listings = await Listing.find()
            .populate("category", "name icon")
            .populate("seller", "username email")
            .populate("address");
        
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Récupérer un listing par ID
export const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate("category")
            .populate("seller", "username email")
            .populate("address");

        if (!listing) {
            return res.status(404).json({ message: "Listing introuvable" });
        }

        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Mettre à jour un listing
export const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!listing) {
            return res.status(404).json({ message: "Listing introuvable" });
        }

        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Supprimer un listing
export const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findByIdAndDelete(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing introuvable" });
        }

        res.json({ message: "Listing supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Recherche/Filtre
export const searchListings = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, condition } = req.query;
        
        let query = { status: "available" };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (category) query.category = category;
        if (condition) query.condition = condition;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const listings = await Listing.find(query)
            .populate("category", "name icon")
            .populate("seller", "username email");

        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};