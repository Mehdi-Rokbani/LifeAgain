import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            trim: true,
            required: [true, "Message content is required"],
        },

        type: {
            type: String,
            enum: ["text", "image", "system"],
            default: "text",
        },

        imageUrl: {
            type: String, // optional for image messages
            default: "",
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
