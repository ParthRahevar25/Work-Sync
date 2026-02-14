import mongoose, { Schema, Document } from "mongoose";

// 1. Define the Interface
export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  role: "admin" | "manager" | "employee";
  employeeId: mongoose.Types.ObjectId;
  isActive: boolean;
  leaveBalance: {
    casual: number;
    sick: number;
    paid: number;
  };
}

const userSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "employee"], default: "employee" },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  isActive: { type: Boolean, default: true },
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 6 },
    paid: { type: Number, default: 6 },
    // Total = 24
  }
}, { timestamps: true });

export default mongoose.model<IUser>("User", userSchema);