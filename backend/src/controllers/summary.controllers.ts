// backend/src/controllers/dashboardController.ts
import { Request, Response } from "express";
import Attendance from "../models/Attendence.model";
import Employee from "../models/Employee.model";
import Leave from "../models/Leaves.model";
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [totalEmployees, presentToday, lateToday, activeLeaves] = await Promise.all([
      Employee.countDocuments(),
      Attendance.countDocuments({ date: { $gte: todayStart, $lte: todayEnd }, status: "Present" }),
      Attendance.countDocuments({ date: { $gte: todayStart, $lte: todayEnd }, isLate: true }),
      Leave.countDocuments({ 
        startDate: { $lte: todayEnd }, 
        endDate: { $gte: todayStart }, 
        status: "Approved" 
      })
    ]);

    const percentage = totalEmployees > 0 
      ? ((presentToday / totalEmployees) * 100).toFixed(1) 
      : "0";

    res.status(200).json({
      attendance: {
        percentage,
        label: `${presentToday} of ${totalEmployees} active`
      },
      leaves: {
        count: activeLeaves.toString().padStart(2, '0'),
        label: "Employees on leave"
      },
      late: {
        count: lateToday.toString().padStart(2, '0'),
        label: "Late arrivals today"
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Summary synchronization failed" });
  }
};