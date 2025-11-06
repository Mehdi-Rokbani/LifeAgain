import User from "../models/User.js";
import bcrypt from "bcryptjs";

// GET ALL USERS (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").populate("addresses");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET ONE USER
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("addresses")
            .populate("favorites", "title price images");

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE USER
export const updateUser = async (req, res) => {
    try {
        const updates = { ...req.body };

        // Optional password change
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
        }).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE USER
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
