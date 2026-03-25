import { Request, Response } from "express";
import Attendance from "../models/Attendence.model";

// Mark attendance (Check-In / Check-Out Toggle)
export const markAttendance = async (req:any, res: Response) => {
  try {
    const employeeId = req.user._id;
    const { type } = req.body; 
    const today = new Date().setHours(0, 0, 0, 0);

    if (type === "checkin") {
      const attendance = await Attendance.create({
        employeeId,
        date: today,
        checkIn: new Date(),
        status: "Present",
      });
      return res.status(201).json({ message: "Checked in", data: attendance });
    } 
    
    if (type === "checkout") {
      const record = await Attendance.findOne({ employeeId, date: today, checkOut: null });
      if (!record) return res.status(404).json({ error: "No active check-in found" });

      record.checkOut = new Date();
      const diff = record.checkOut.getTime() - record.checkIn.getTime();
      record.workHours = Number((diff / (1000 * 60 * 60)).toFixed(2));

      await record.save();
      return res.json({ message: "Checked out", data: record });
    }
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ error: "Already checked in today" });
    res.status(500).json({ error: "Server error" });
  }
};

// Get own attendance 
export const getMyAttendance = async (req: any, res: Response) => {
  try {
    const employeeId = req.user._id;
    const records = await Attendance.find({ employeeId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch record" });
  }
};

// Admin view all attendance 
export const getAllAttendance = async (_req: Request, res: Response) => {
  try {
    const records = await Attendance.find()
      .populate("employeeId", "email name role") // Populate User details
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
};

// Update attendance 
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Attendance.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: "Attendance updated", data: updated });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};