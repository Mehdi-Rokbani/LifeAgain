import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        // With recent MongoDB Node driver / Mongoose versions these options
        // are no longer needed and are ignored; connect using the URI only.
        await mongoose.connect(process.env.URL);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1); // Stop the server if DB fails
    }
};

export default connectDB;
