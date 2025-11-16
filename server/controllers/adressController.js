import Address from "../models/Address.js";
import User from "../models/User.js";

export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id; // coming from auth middleware
        const { street, city, postalCode, country } = req.body;

        // Create address
        const address = await Address.create({
            user: userId,
            street,
            city,
            postalCode,
            country,
            location: {
                type: "Point",
                coordinates: [0, 0],
            },
        });

        // Attach address to user
        await User.findByIdAndUpdate(userId, {
            $push: { addresses: address._id },
        });

        res.status(201).json({
            message: "Address added successfully",
            address,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
