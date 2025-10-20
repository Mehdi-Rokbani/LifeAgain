import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            minlength: 3,
            maxlength: 30,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // exclude password by default
        },

        role: {
            type: String,
            enum: ["client", "admin", "seller"],
            default: "client",
        },

        phone: {
            type: String,
            match: [/^[0-9]{8,15}$/, "Invalid phone number"],
        },

        profilePicture: {
            type: String, // store image URL or Cloudinary path
            default: "",
        },
        addresses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address"
        }],
        favorites: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing"
        }]




    },
    { timestamps: true } // adds createdAt & updatedAt
);

export default mongoose.model("User", userSchema);
