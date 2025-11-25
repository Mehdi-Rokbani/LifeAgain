import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Address from "../models/Address.js";


export const addAddress = async (req, res) => {
    /*
    try {
        const { userId, street, city, postalCode, country } = req.body;

        const address = await Address.create({
            user: userId,
            street,
            city,
            postalCode,
            country,
        });

        res.json({ message: "Address added", address });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }*/
};

export const updatePfp = async (req, res) => {
    /*
    try {
        const { userId, url } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture: url },
            { new: true }
        );

        res.json({ message: "Profile picture updated", user });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }*/
};












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
        const userId = req.user.id; // from protect middleware
        const updates = { ...req.body };

        // ❌ Forbid role update
        if (updates.role) delete updates.role;

        // ❌ Forbid verification fields
        const forbidden = ["isVerified", "verificationCode", "verificationExpires"];
        forbidden.forEach(f => delete updates[f]);

        // ==============================
        // 1️⃣ UNIQUE EMAIL CHECK
        // ==============================
        if (updates.email) {
            const emailExists = await User.findOne({
                email: updates.email,
                _id: { $ne: userId }, // ignore my own email
            });

            if (emailExists)
                return res.status(400).json({ message: "Email already in use." });
        }

        // ==============================
        // 2️⃣ UNIQUE USERNAME CHECK
        // ==============================
        if (updates.username) {
            const usernameExists = await User.findOne({
                username: updates.username,
                _id: { $ne: userId },
            });

            if (usernameExists)
                return res.status(400).json({ message: "Username already taken." });
        }

        // ==============================
        // 3️⃣ HASH PASSWORD IF UPDATED
        // ==============================
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        // ==============================
        // 4️⃣ UPDATE USER
        // ==============================
        const updated = await User.findByIdAndUpdate(userId, updates, {
            new: true,
        }).select("-password");

        if (!updated)
            return res.status(404).json({ message: "User not found" });

        res.json({
            message: "Profile updated successfully",
            user: updated,
        });

    } catch (err) {
        console.log("UPDATE USER ERROR:", err);
        res.status(500).json({ message: "Server error during update." });
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
