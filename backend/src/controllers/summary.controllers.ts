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
      Leave.countDocuments({ startDate: { $lte: todayEnd }, endDate: { $gte: todayStart }, status: "Approved" }),
    ]);
 
    const percentage = totalEmployees > 0
      ? ((presentToday / totalEmployees) * 100).toFixed(1)
      : "0";
 
    res.status(200).json({
      attendance: { percentage, label: `${presentToday} of ${totalEmployees} active` },
      leaves:     { count: activeLeaves.toString().padStart(2, "0"), label: "Employees on leave" },
      late:       { count: lateToday.toString().padStart(2, "0"), label: "Late arrivals today" },
    });
  } catch (error) {
    res.status(500).json({ message: "Summary synchronization failed" });
  }
};
 

export const getWeeklyAttendance = async (_req: Request, res: Response) => {
  try {
    const totalEmployees = await Employee.countDocuments();
 
    // Build last 7 days oldest → newest
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end   = new Date(d); end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        date:  d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    });
 
    const results = await Promise.all(
      days.map(async ({ start, end, label, date }) => {
        const [present, late] = await Promise.all([
          Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: "Present" }),
          Attendance.countDocuments({ date: { $gte: start, $lte: end }, isLate: true }),
        ]);
        return { day: label, date, present, absent: Math.max(0, totalEmployees - present), late };
      })
    );
 
    res.status(200).json(results);
  } catch (error) {
    console.error("Weekly attendance error:", error);
    res.status(500).json({ message: "Failed to fetch weekly data" });
  }
};
 
export const getDepartmentBreakdown = async (_req: Request, res: Response) => {
  try {
    const breakdown = await Employee.aggregate([
      { $group: { _id: "$department", value: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", value: 1 } },
      { $sort: { value: -1 } },
    ]);
 
    // Drop any documents missing a department field
    res.status(200).json(breakdown.filter((d) => d.name?.trim()));
  } catch (error) {
    console.error("Department breakdown error:", error);
    res.status(500).json({ message: "Failed to fetch department data" });
  }
};
 
export const getTopPerformers = async (_req: Request, res: Response) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
 
    const performers = await Attendance.aggregate([
      {
        $match: {
          date:      { $gte: monthStart, $lte: monthEnd },
          checkOut:  { $ne: null },
          workHours: { $gt: 0 },
        },
      },
      {
        // Sum hours + count days present (used as "streak")
        $group: { _id: "$employeeId", hours: { $sum: "$workHours" }, streak: { $sum: 1 } },
      },
      { $sort: { hours: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:         "employees",
          localField:   "_id",
          foreignField: "_id",
          as:           "employee",
        },
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id:    0,
          name:   "$employee.name",
          dept:   "$employee.department",
          hours:  { $round: ["$hours", 1] },
          streak: 1,
        },
      },
    ]);
 
    res.status(200).json(performers);
  } catch (error) {
    console.error("Top performers error:", error);
    res.status(500).json({ message: "Failed to fetch performers" });
  }
};
 