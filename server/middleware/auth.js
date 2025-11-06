import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const token =
            req.headers.authorization?.split(" ")[1] ||
            req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // contains { id, role }
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }
    next();
};
