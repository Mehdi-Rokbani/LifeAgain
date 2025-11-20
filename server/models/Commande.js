import mongoose from "mongoose";

const commandeSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ⭐ NOUVEAU : Plusieurs produits au lieu d'un seul
        items: [
            {
                listing: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Listing",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            }
        ],

        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
        },

        // ⭐ NOUVEAU : Informations de facturation du formulaire
        billingDetails: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            companyName: String,
            country: { type: String, required: true },
            streetAddress: { type: String, required: true },
            city: { type: String, required: true },
            province: String,
            zipCode: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String, required: true },
        },

        totalPrice: {
            type: Number,
            required: true,
            min: [0, "Total price cannot be negative"],
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "bank", "card", "paypal", "transfer"],
            default: "cash",
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
            default: "pending",
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        isPaid: {
            type: Boolean,
            default: false,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        deliveredAt: {
            type: Date,
            default: null,
        },

        // ⭐ NOUVEAU : Numéro de commande unique
        orderNumber: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

// Génère un numéro de commande unique avant la sauvegarde
commandeSchema.pre("save", function (next) {
    if (!this.orderNumber) {
        this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

export default mongoose.model("Commande", commandeSchema, "Commande");