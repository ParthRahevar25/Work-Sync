import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  workHours: { type: Number, default: 0 }, // Store hours here
  status: { type: String, enum: ["Present", "Absent", "Late"], default: "Present" },
});

// Ensure an employee can only have one attendance record per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
