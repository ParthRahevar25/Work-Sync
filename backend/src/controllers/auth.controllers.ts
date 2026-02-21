import { Request, Response } from "express";
import User from "../models/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// 1. Get Current User Data
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("employeeId"); 
    
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// 2. Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role }, // 💡 Added role back to token for the middleware to read!
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    // 🔒 Set Cookie
    res.cookie("token", token, {
        httpOnly: true,     
        secure: process.env.NODE_ENV === "production", // false on localhost
        sameSite: "lax", // 👈 Use 'lax' for better cross-port compatibility on localhost
        maxAge: 24 * 60 * 60 * 1000 
      });

    const userWithoutPassword = user.toObject();

    return res.json({ 
      user: userWithoutPassword 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
};

// 3. Logout
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  return res.json({ message: "Logged out successfully" });
};