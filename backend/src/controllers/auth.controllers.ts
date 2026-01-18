import { Request, Response } from "express";
import Employee from "../models/Employee.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Login
export const login = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await Employee.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    // For now, no password, later add hashed passwords
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
