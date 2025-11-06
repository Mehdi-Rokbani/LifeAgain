import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },

        url: {
            type: String,
            required: [true, "Image URL is required"],
        },

        isCover: {
            type: Boolean,
            default: false,
        },

        caption: {
            type: String,
            trim: true,
            maxlength: 200,
        },

        order: {
            type: Number,
            default: 0,
        },

        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Ensure one cover image per listing
imageSchema.index({ listing: 1, isCover: 1 }, { unique: true, partialFilterExpression: { isCover: true } });

export default mongoose.model("Image", imageSchema, "Image");
