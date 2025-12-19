import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

// -------------------------------------------------------
// CREATE a conversation between Client <-> Seller
// -------------------------------------------------------
export const createConversation = async (req, res) => {
    try {
        const user1 = req.user.id;      // Logged-in user FROM TOKEN
        const { user2 } = req.body;     // Receiver ID from body

        if (!user2) {
            return res.status(400).json({ message: "Receiver is required" });
        }

        if (user1 === user2) {
            return res.status(400).json({ message: "Cannot start a chat with yourself" });
        }

        // Fetch both users
        const senderUser = await User.findById(user1);
        const receiverUser = await User.findById(user2);

        if (!senderUser || !receiverUser) {
            return res.status(404).json({ message: "One of the users does not exist" });
        }

        // Only client <-> seller allowed
        const validRoles =
            (senderUser.role === "client" && receiverUser.role === "seller") ||
            (senderUser.role === "seller" && receiverUser.role === "client");

        if (!validRoles) {
            return res.status(403).json({
                message: "Chat is only allowed between a client and a seller.",
            });
        }

        // Check if an existing conversation exists
        let conversation = await Conversation.findOne({
            participants: { $all: [user1, user2] }
        });

        // If does NOT exist → create new
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [user1, user2],
                lastMessage: "",
                lastSender: null,
                unreadBy: []
            });
        }

        return res.status(200).json(conversation);

    } catch (err) {
        console.error("CREATE CONVERSATION ERROR:", err);
        return res.status(500).json({ message: "Server error creating conversation." });
    }
};

// -------------------------------------------------------
// GET all conversations of the logged-in user
// WITH BONUS: otherUser + unread flag
// -------------------------------------------------------
export const getUserConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        let conversations = await Conversation.find({
            participants: userId
        })
            .populate("participants", "username role profilePicture")
            .sort({ updatedAt: -1 });

        // Add: otherUser + unread flags
        conversations = conversations.map(conv => {
            const obj = conv.toObject();

            const otherUser = obj.participants.find(
                (p) => p._id.toString() !== userId
            );

            return {
                ...obj,
                otherUser: otherUser || null,
                unread: obj.unreadBy.includes(userId)
            };
        });

        return res.status(200).json(conversations);

    } catch (err) {
        console.error("GET CONVERSATIONS ERROR:", err);
        return res.status(500).json({ message: "Server error fetching conversations." });
    }
};

// -------------------------------------------------------
// MARK conversation as read
// -------------------------------------------------------
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.body;

        if (!conversationId) {
            return res.status(400).json({ message: "Conversation ID is required." });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        // Remove user from unread list
        conversation.unreadBy = conversation.unreadBy.filter(
            (id) => id.toString() !== userId
        );

        await conversation.save();

        return res.status(200).json({ message: "Marked as read." });

    } catch (err) {
        console.error("MARK AS READ ERROR:", err);
        return res.status(500).json({ message: "Server error marking as read." });
    }
};
