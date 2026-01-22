import { Request, Response } from "express";
import Attendance from "../models/Attendence.model";

// 🔹 Mark attendance (Employee / Admin)
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { date, checkIn, checkOut, status } = req.body;

    // const employeeId = req.user!.userId;
    const employeeId = (req as any).user.userId;


    const attendance = await Attendance.create({
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      markedBy: "self",
    });

    res.status(201).json({
      message: "Attendance marked",
      data: attendance,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Attendance already marked" });
    }
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};

// 🔹 Get own attendance
export const getMyAttendance = async (req: Request, res: Response) => {
//   const employeeId = req.user!.userId;
const employeeId = (req as any).user.userId;


  const records = await Attendance.find({ employeeId }).sort({ date: -1 });

  res.json(records);
};

// 🔹 Admin / Manager view all attendance
export const getAllAttendance = async (_req: Request, res: Response) => {
  const records = await Attendance.find()
    .populate("employeeId", "name employeeCode department")
    .sort({ date: -1 });

  res.json(records);
};

// 🔹 Update attendance (Admin only)
export const updateAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;

  const updated = await Attendance.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.json({
    message: "Attendance updated",
    data: updated,
  });
};
