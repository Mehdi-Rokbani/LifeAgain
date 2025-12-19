    import mongoose from "mongoose";

    const panierSchema = new mongoose.Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                unique: true, // 1 active panier per user
            },

            items: [
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Listing",
                        required: true,
                        unique: true,
                    },
                },
            ],

            status: {
                type: String,
                enum: ["active", "checked_out"],
                default: "active",
            },
        },
        { timestamps: true }
    );

    export default mongoose.model("Panier", panierSchema);
