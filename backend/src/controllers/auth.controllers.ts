import { Request, Response } from "express";
import User from "../models/User.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// 1. Get Current User Data (The "Me" Route)
export const getMe = async (req: any, res: Response) => {
  try {
    // req.user.userId comes from your JWT/Protect middleware
    const user = await User.findById(req.user.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching profile" });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    // Ensure leaveBalance is sent to frontend on login
    return res.json({ token, user: userWithoutPassword });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  return res.json({ message: "Logged out successfully" });
};