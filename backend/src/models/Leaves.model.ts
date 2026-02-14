import mongoose from "mongoose";

// models/Leave.model.ts
const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  type: { type: String, enum: ["Casual", "Sick", "Paid"], default: "Casual" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  appliedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Leave", leaveSchema);
