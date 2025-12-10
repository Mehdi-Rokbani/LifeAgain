import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        street: {
            type: String,
            required: [true, "Street is required"],
            trim: true,
            minlength: 3,
            maxlength: 100
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true,
            match: [/^[A-Za-z0-9\- ]{3,10}$/, "Invalid postal code"]
        },

        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true
        },

        latitude: {
            type: Number
        },

        longitude: {
            type: Number
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },

        listings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Listing"
            }
        ]
    },
    { timestamps: true }
);
addressSchema.index({ location: "2dsphere" });
export default mongoose.model("Address", addressSchema, "Address");
