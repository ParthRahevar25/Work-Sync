import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,
    },

    checkOut: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late", "half-day"],
      default: "present",
    },

    markedBy: {
      type: String,
      enum: ["self", "system", "admin"],
      default: "self",
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance per day per employee
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
