import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.model";

// 🔹 Create user (Admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role, employeeId } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      employeeId,
    });

    res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
};

// 🔹 Get all users (Admin / Manager)
export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find()
    .populate("employeeId", "name employeeCode department");

  res.json(users);
};

// 🔹 Get single user
export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .populate("employeeId", "name email department");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

// 🔹 Activate / Deactivate user
export const toggleUserStatus = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    message: "User status updated",
    isActive: user.isActive,
  });
};
