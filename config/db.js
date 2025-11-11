import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB);
        console.log("Database Connected");
    } catch (error) {
        console.log("Error", error)
    }
}

export default connectDB;