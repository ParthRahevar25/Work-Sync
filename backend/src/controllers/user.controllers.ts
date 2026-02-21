import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.model";

// 🔹 Create user (Admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role, employeeId, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      role,
      employeeId,
    });

    // Convert to object and strip password if select:false isn't in model
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      data: userResponse, // 👈 Safe sanitized data
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  // If you didn't add select:false to the model, use .select("-password") here
  const users = await User.find()
    .select("-password") // 👈 Explicitly exclude password
    .populate("employeeId", "name employeeCode department");

  res.json(users);
};

// 🔹 Get single user
export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .select("-password") // 👈 Always add this to profile fetches too
    .populate("employeeId", "name email department");
    
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// 🔹 Activate / Deactivate user
export const toggleUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Prevent self-deactivation if you want to be extra safe
  // if (req.user.id === id) return res.status(400).json({ message: "Cannot deactivate yourself" });

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isActive = !user.isActive;
  await user.save();

  res.json({ message: "Status updated", isActive: user.isActive });
};