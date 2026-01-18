import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  date: Date,
  checkIn: Date,
  checkOut: Date,
  status: String
});

export default mongoose.model("Attendance", attendanceSchema);
