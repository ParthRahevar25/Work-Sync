import { Request, Response } from "express";
import { generateAIResponse } from "./ai.service";
import Leave from "../models/Leaves.model";
import Employee from "../models/Employee.model";

export const chatWithAI = async (req: any, res: Response) => {
  try {
    const user = req.user; 
    const { message } = req.body;

    // Correctly handle the populated employeeId from your new middleware
    const empId = user.employeeId._id || user.employeeId;
    const employeeData = await Employee.findById(empId);

    const context = {
      userId: user?._id,
      role: user?.role,
      name: employeeData?.name || "Employee"
    };

    const aiResponse = await generateAIResponse(message, context);

    // ACTION: GET BALANCE
    if (aiResponse.action === "GET_LEAVE_BALANCE") {
      const lb = user?.leaveBalance; 
      const total = (lb?.casual || 0) + (lb?.sick || 0) + (lb?.paid || 0);
      return res.json({
        message: `You have ${total} total leaves remaining.`,
        balanceBreakdown: { casual: lb?.casual || 0, sick: lb?.sick || 0, paid: lb?.paid || 0, total }
      });
    }

    // ACTION: APPLY LEAVE
    if (aiResponse.action === "APPLY_LEAVE") {
  const { startDate, endDate, type, reason } = aiResponse.data;

  const newLeave = await Leave.create({
    // ⚡ THE FIX: Use the User ID (_id), not the employeeId object
    employeeId: user._id, 
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    type: type || "casual",
    reason: reason || "Applied via Nexus AI",
    status: "pending",
  });

  // Populate immediately so the response back to the AI also has the name
  const populatedLeave = await newLeave.populate("employeeId", "name email");

  return res.json({
    message: `Done! I've submitted your request.`,
    leave: populatedLeave,
    action: "APPLY_LEAVE"
  });
}

    // ACTION: GET HISTORY
    if (aiResponse.action === "GET_MY_LEAVES") {
      const leaves = await Leave.find({ employeeId: empId }).sort({ startDate: -1 });
      return res.json({
        message: `I found ${leaves.length} leave applications in your records.`,
        leaves,
      });
    }

    // DEFAULT: General Chat
    return res.json(aiResponse);

  } catch (err) {
    console.error("AI Controller Error:", err);
    res.status(500).json({ error: "WorkSync AI is currently offline. Please try again later." });
  }
};