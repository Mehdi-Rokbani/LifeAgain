import mongoose from "mongoose";

const panierSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Each cart can contain multiple Commandes
        commandes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Commande",
                required: true,
            },
        ],

        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },

        status: {
            type: String,
            enum: ["active", "checked_out", "abandoned"],
            default: "active",
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// 🔹 Auto-calculate total from commandes
panierSchema.pre("save", async function (next) {
    const Commande = mongoose.model("Commande");

    const commandesDocs = await Commande.find({ _id: { $in: this.commandes } });
    this.totalPrice = commandesDocs.reduce((sum, cmd) => sum + cmd.totalPrice, 0);

    next();
});

export default mongoose.model("Panier", panierSchema, "Panier");
