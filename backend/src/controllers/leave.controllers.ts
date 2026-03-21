import { Request, Response } from "express";
import mongoose from "mongoose";
import Leave from "../models/Leaves.model";
import User from "../models/User.model";
import { createNotification } from "./notification.controllers";

export const applyLeave = async (req: any, res: Response) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const employeeId = req.user._id;

    // Days calculation (inclusive of both endpoints)
    const start         = new Date(startDate);
    const end           = new Date(endDate);
    const requestedDays = Math.ceil(
      Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Balance check
    const user = await User.findById(employeeId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const leaveType      = type.toLowerCase() as "casual" | "sick" | "paid";
    const currentBalance = user.leaveBalance[leaveType];
    if (currentBalance < requestedDays) {
      return res.status(400).json({
        error: `Insufficient balance. You requested ${requestedDays} days but only have ${currentBalance} ${type} leaves left.`,
      });
    }

    // Create leave — schema default status is "pending" (lowercase)
    const newLeave = await Leave.create({ employeeId, type, startDate, endDate, reason });

    // ── Notify all admins + managers ─────────────────────────────────────────
    const recipients = await User.find(
      { role: { $in: ["admin", "manager"] }, isActive: true },
      "_id"
    );
    const recipientIds = recipients.map(u => u._id as mongoose.Types.ObjectId);

    if (recipientIds.length) {
      const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      await createNotification(
        recipientIds,
        "New Leave Request",
        `${user.name} applied for ${type} leave (${fmt(start)} – ${fmt(end)}). Reason: ${reason}`,
        "leave_applied"
      );
    }

    res.status(201).json({ message: "Leave applied successfully", data: newLeave });
  } catch (err) {
    console.error("applyLeave error:", err);
    res.status(500).json({ error: "Failed to apply for leave" });
  }
};

export const getAllLeaves = async (_req: Request, res: Response) => {
  try {
    const leaves = await Leave.find()
      .populate("employeeId", "name email")
      .sort({ appliedAt: -1 });
    res.json(leaves);
  } catch {
    res.status(500).json({ error: "Failed to fetch leaves" });
  }
};

export const getMyLeaves = async (req: any, res: Response) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user._id })
      .sort({ appliedAt: -1 });
    res.json(leaves);
  } catch {
    res.status(500).json({ error: "Failed to fetch your leave history" });
  }
};

export const updateLeaveStatus = async (req: any, res: Response) => {
  try {
    const { id }     = req.params;
    const { status } = req.body; // frontend sends "Approved" or "Rejected"

    // Normalise → schema stores "approved" / "rejected"
    const normalised = status.toLowerCase() as "approved" | "rejected";

    const leave = await Leave.findById(id).populate("employeeId", "name email");
    if (!leave) return res.status(404).json({ error: "Request not found" });

    // Deduct balance only on first approval
    if (normalised === "approved" && leave.status !== "approved") {
      const start    = new Date(leave.startDate);
      const end      = new Date(leave.endDate);
      const diffDays = Math.ceil(
        Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      await User.findByIdAndUpdate(
        leave.employeeId,
        { $inc: { [`leaveBalance.${leave.type.toLowerCase()}`]: -diffDays } }
      );
    }

    leave.status = normalised;
    await leave.save();

    // ── Notify the employee ───────────────────────────────────────────────────
    const populated  = leave.employeeId as any;
    const employeeId = populated?._id ?? leave.employeeId;
    const adminName  = req.user?.name ?? "Admin";
    const isApproved = normalised === "approved";

    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dateRange = `${fmt(new Date(leave.startDate))} – ${fmt(new Date(leave.endDate))}`;

    await createNotification(
      [employeeId as mongoose.Types.ObjectId],
      isApproved ? "Leave Approved ✓" : "Leave Rejected",
      isApproved
        ? `Your ${leave.type} leave (${dateRange}) was approved by ${adminName}.`
        : `Your ${leave.type} leave (${dateRange}) was not approved by ${adminName}.`,
      isApproved ? "leave_approved" : "leave_rejected"
    );

    res.json({ message: `Leave ${normalised} successfully`, data: leave });
  } catch (err) {
    console.error("updateLeaveStatus error:", err);
    res.status(500).json({ error: "Failed to update leave status" });
  }
};