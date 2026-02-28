import { Request, Response } from "express";
import { generateAIResponse } from "./ai.service";
import Leave from "../models/Leaves.model";
import Employee from "../models/Employee.model";

export const chatWithAI = async (req: any, res: Response) => {
  try {
    const user = req.user; // This contains email, role, AND leaveBalance
    const { message } = req.body;

    // Fetch employee for personal touch (name/designation)
    const employeeData = await Employee.findById(user.employeeId);

    const context = {
      userId: user?._id,
      role: user?.role,
      name: employeeData?.name 
    };

    const aiResponse = await generateAIResponse(message, context);

    if (aiResponse.action === "GET_LEAVE_BALANCE") {
      // 1. Get the balance from the USER object where you defined it
      const lb = user?.leaveBalance; 
      const total = (lb?.casual || 0) + (lb?.sick || 0) + (lb?.paid || 0);

      return res.json({
        message: `Total balance: ${total} days (Casual: ${lb?.casual}, Sick: ${lb?.sick}, Paid: ${lb?.paid})`,
        balanceBreakdown: {
          casual: lb?.casual || 0,
          sick: lb?.sick || 0,
          paid: lb?.paid || 0,
          total
        }
      });
    }

    if (aiResponse.action === "GET_MY_LEAVES") {
      const leaves = await Leave.find({ employeeId: user.employeeId });
      return res.json({
        message: `I found ${leaves.length} leave applications.`,
        leaves,
      });
    }

    return res.json(aiResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "WorkSync AI Sync Failed" });
  }
};