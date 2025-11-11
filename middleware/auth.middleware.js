import User from "../model/user.model.js";
import Jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: no token provided" })
        }

        const token = authHeader.split(" ")[1];
        const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(401).json({ message: "Unauthorized - Invalid token" })
    }
}

export const isTeacher = async (req, res, next) => {
    if (req.user?.role !== 'Teacher') {
        return res.status(403).json({ message: "Access Denied: Teachers only" })
    }
    next();
}