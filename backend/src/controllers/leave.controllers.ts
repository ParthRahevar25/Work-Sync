import { Request, Response } from "express";
import Leave from "../models/Leaves.model";
import User from "../models/User.model";

// 🔹 Employee applies for leave
export const applyLeave = async (req: any, res: Response) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const employeeId = req.user.userId;

    // 1. Calculate requested days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 2. Find user and check balance
    const user = await User.findById(employeeId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const leaveType = type.toLowerCase() as 'casual' | 'sick' | 'paid';
    const currentBalance = user.leaveBalance[leaveType];

    if (currentBalance < requestedDays) {
      return res.status(400).json({ 
        error: `Insufficient balance. You requested ${requestedDays} days but only have ${currentBalance} ${type} leaves left.` 
      });
    }

    // 3. Create request if balance is okay
    const newLeave = await Leave.create({
      employeeId,
      type,
      startDate,
      endDate,
      reason
    });

    res.status(201).json({ message: "Leave applied successfully", data: newLeave });
  } catch (error) {
    res.status(500).json({ error: "Failed to apply for leave" });
  }
};

// 🔹 Admin fetches all leaves to review
export const getAllLeaves = async (req: Request, res: Response) => {
  try {
    const leaves = await Leave.find().populate("employeeId", "name email");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaves" });
  }
};

export const getMyLeaves = async (req: any, res: Response) => {
  try {
    const employeeId = req.user.userId; // Extracted from JWT middleware
    const leaves = await Leave.find({ employeeId }).sort({ appliedAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch your leave history" });
  }
};

// 🔹 Admin updates leave status
export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"

    // 1. Find the leave request
    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) return res.status(404).json({ error: "Request not found" });

    // 2. Only process balance deduction if the status is changing to "Approved"
    if (status === "Approved" && leaveRequest.status !== "Approved") {
      
      // Calculate total days (including start and end date)
      const start = new Date(leaveRequest.startDate);
      const end = new Date(leaveRequest.endDate);
      
      // Formula: (End - Start) / ms_per_day + 1
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const leaveType = leaveRequest.type.toLowerCase(); // "casual", "sick", or "paid"

      // 3. Subtract from the specific employee's balance
      const updatedUser = await User.findByIdAndUpdate(
        leaveRequest.employeeId,
        { $inc: { [`leaveBalance.${leaveType}`]: -diffDays } },
        { new: true }
      );

    }

    // 4. Update the leave request status
    leaveRequest.status = status;
    await leaveRequest.save();

    res.json({ message: `Leave ${status} successfully`, data: leaveRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update leave status" });
  }
};