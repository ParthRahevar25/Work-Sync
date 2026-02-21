import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    role: string;
    email?: string;
    [key: string]: any;
  };
}

export const requireRole = (roles: string[]) => 
  (req: RequestWithUser, res: Response, next: NextFunction) => {
    // 🔒 CHANGE: Look for the token in cookies instead of headers
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ error: "No session found, please login" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Attach the decoded user data to the request object
      req.user = decoded;

      // Check if the user's role is allowed
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Access denied: Insufficient permissions" });
      }

      next();
    } catch (err) {
      // Clear the invalid cookie to force the user to log in again
      res.clearCookie("token");
      return res.status(401).json({ error: "Session expired or invalid" });
    }
};
