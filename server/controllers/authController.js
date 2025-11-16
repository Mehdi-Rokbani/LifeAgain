import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "../models/Address.js";
import "../models/Listing.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { randomBytes } from "crypto";


// REGISTER
export const register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = Date.now() + 6 * 60 * 60 * 1000; // 6 hours

        const user = await User.create({
            username,
            email,
            password: hashed,
            phone,
            verificationToken,
            verificationExpires,
        });

        // Verification link
        const verifyURL = `http://localhost:5173/verify?token=${verificationToken}`;

        // Send email
        await sendEmail(
            email,
            "Verify your LifeAgain account",
            `
                <p>Hi ${username},</p>
                <p>Click the link below to verify your email:</p>
                <a href="${verifyURL}">${verifyURL}</a>
                <p>This link expires in 6 hours.</p>
            `
        );

        res.status(201).json({
            message: "Registration successful. Check your email to verify your account.",
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });
        if (!user.verified) {
            return res.status(400).json({ message: "Please verify your email first." });
        }
        

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET PROFILE
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            // 1️⃣ populate addresses (show only useful fields)
            .populate({
                path: "addresses",
                select: "street city country postalCode",
                options: { strictPopulate: false }
            })
            // 2️⃣ populate favorites -> listing (nested)
            .populate({
                path: "favorites",
                populate: {
                    path: "listing",
                    select: "title price images category location",
                    populate: { path: "category", select: "name" }, // nested again if you have category
                    options: { strictPopulate: false }
                },
                options: { strictPopulate: false }
            });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};