import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "../models/Address.js";
import "../models/Listing.js";
import Address from "../models/Address.js";


import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "rokbanimehdi6@gmail.com",
        pass: process.env.MAIL_PASS
    }
});


export const register = async (req, res) => {
    try {
        const { username, email, password, phone, role } = req.body;

        // Required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        // Validate role
        const allowedRoles = ["client", "seller", "admin"];
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role selected." });
        }

        // Check email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // Check username
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: "Username already taken." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // User creation
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            phone: phone || "",
            role: role || "client",   // DEFAULT = CLIENT
            profilePicture: "",
            isVerified: false,
        });

        return res.status(201).json({
            message: "User registered successfully.",
            userId: user._id,
        });

    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `${field} is already in use.` });
        }

        return res.status(500).json({ message: "Server error during registration." });
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




export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        if (user.verificationCode !== code)
            return res.status(400).json({ message: "Invalid code" });

        if (user.verificationExpires < Date.now())
            return res.status(400).json({ message: "Code expired" });

        user.isVerified = true;
        user.verificationCode = null;
        user.verificationExpires = null;
        await user.save();

        res.json({ message: "Email verified" });

    } catch (err) {
        console.log("VERIFY EMAIL ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};



export const sendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 30 * 60 * 1000;

        user.verificationCode = code;
        user.verificationExpires = expires;
        await user.save();

        await transporter.sendMail({
            from: "rokbanimehdi6@gmail.com",
            to: email,
            subject: "Verify Your Email",
            text: `Your verification code is ${code}. It expires in 30 minutes.`,
        });

        res.json({ message: "Verification code sent" });

    } catch (err) {
        console.log("SEND VERIFICATION ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};
