import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeCode: String,
  name: String,
  department: String,
  designation: String,
  email: String,
  role: { type: String, enum: ["admin", "manager", "employee"] },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  joiningDate: Date,
  status: { type: String, default: "active" }
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
