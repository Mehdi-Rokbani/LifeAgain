import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],


    lastMessage: {
      type: String,
      default: "",
    },

    lastSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    unreadBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Avoid creating duplicate conversations between the same participants
conversationSchema.index(
  { participants: 1, listing: 1 },
  { unique: true, partialFilterExpression: { listing: { $type: "objectId" } } }
);

export default mongoose.model("Conversation", conversationSchema);
