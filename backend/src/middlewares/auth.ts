import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// export const requireRole = (roles: string[]) => 
//   (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ error: "No token provided" });

//     const token = authHeader.split(" ")[1]; // Bearer TOKEN
//     try {
//       const decoded = jwt.verify(token, JWT_SECRET) as any;
//       req.user = decoded; // now TypeScript should recognize this

//       if (!roles.includes(decoded.role)) {
//         return res.status(403).json({ error: "Forbidden" });
//       }

//       next();
//     } catch (err) {
//       return res.status(401).json({ error: "Invalid token" });
//     }
// };
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
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1]; // Bearer TOKEN
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded; // ✅ now TS knows about `user`

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
};

