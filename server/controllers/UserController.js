import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

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
export const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "lifeagain_profile_pics",
        });

        // Remove temp file from local storage
        fs.unlinkSync(req.file.path);

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture: result.secure_url },
            { new: true }
        );
        await User.findByIdAndUpdate(
            userId,
            { 
                profilePicture: result.secure_url,
                onboardingCompleted: true 
            },
            { new: true }
        );
        

        res.json({
            message: "Profile picture updated",
            imageUrl: user.profilePicture,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const skipPicture = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            onboardingCompleted: true
        });

        res.json({ message: "Onboarding completed without profile picture" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

