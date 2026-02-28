import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// 1. Create a clean interface that includes your User model properties
interface RequestWithUser extends Request {
  user?: any;
}

export const requireRole = (roles: string[]) => 
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.cookies.token; 

    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Fetch user AND populate employeeId so data is available globally
      const fullUser = await User.findById(decoded.id || decoded.userId)
        .populate("employeeId"); 

      if (!fullUser) return res.status(401).json({ error: "User not found" });

      req.user = fullUser; // Now req.user is the full Mongoose document

      if (!roles.includes(fullUser.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
};