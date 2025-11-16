import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.verified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        // Issue JWT
        const authToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Email verified successfully",
            token: authToken,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
