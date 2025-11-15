import mongoose from "mongoose";

const panierSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Listing",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                }
            }
        ],

        totalPrice: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["active", "checked_out"],
            default: "active",
        }
    },
    { timestamps: true }
);

// recalcul automatique du total
panierSchema.pre("save", function (next) {
    this.totalPrice = this.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    next();
});

export default mongoose.model("Panier", panierSchema);
