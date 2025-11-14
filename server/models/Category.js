import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            unique: true,
            maxlength: 50,
        },

        icon: {
            type: String, // URL or icon name (e.g., "fa-car" or "https://cdn.com/icon.png")
           // trim: true,
            default: "",
        },

       /* parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null, // null → top-level category
        },*/
         parentCategory: {
            type: String,
            trim: true,
            default: null, // null → top-level category
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Unique index for category name
categorySchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema, "Category");
