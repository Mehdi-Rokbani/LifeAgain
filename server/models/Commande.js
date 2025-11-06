import mongoose from "mongoose";

const commandeSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },

        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
            default: 1,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: [0, "Total price cannot be negative"],
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "card", "paypal", "transfer"],
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
    },
    { timestamps: true }
);

// Automatically calculate total price if not provided
commandeSchema.pre("validate", async function (next) {
    if (!this.totalPrice && this.listing && this.quantity) {
        const Listing = mongoose.model("Listing");
        const product = await Listing.findById(this.listing);
        if (product) this.totalPrice = product.price * this.quantity;
    }
    next();
});

export default mongoose.model("Commande", commandeSchema, "Commande");
