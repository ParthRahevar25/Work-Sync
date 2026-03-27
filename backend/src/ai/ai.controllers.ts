import { Response } from "express";
import { generateAIResponse } from "./ai.service";
import Leave from "../models/Leaves.model";
import Employee from "../models/Employee.model";
import User from "../models/User.model";
import Attendance from "../models/Attendence.model";

export const chatWithAI = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { message, history = [] } = req.body;

    // Get employee profile data
    const empId = user.employeeId?._id || user.employeeId;
    const employeeData = await Employee.findById(empId);

    const context = {
      userId: user?._id,
      role: user?.role,
      name: employeeData?.name || user?.name || "Employee",
    };

    const aiResponse = await generateAIResponse(message, context, history);

    // ─────────────────────────────────────────────
    // EMPLOYEE ACTIONS
    // ─────────────────────────────────────────────

    // GET LEAVE BALANCE
    if (aiResponse.action === "GET_LEAVE_BALANCE") {
      const lb = user?.leaveBalance;
      const total = (lb?.casual || 0) + (lb?.sick || 0) + (lb?.paid || 0);
      return res.json({
        message: `You have ${total} total leaves remaining.`,
        action: "GET_LEAVE_BALANCE",
        balanceBreakdown: {
          casual: lb?.casual || 0,
          sick: lb?.sick || 0,
          paid: lb?.paid || 0,
          total,
        },
      });
    }

    // GET MY LEAVE HISTORY
    if (aiResponse.action === "GET_MY_LEAVES") {
      const leaves = await Leave.find({ employeeId: user._id }).sort({
        startDate: -1,
      });
      return res.json({
        message: `I found ${leaves.length} leave application(s) in your records.`,
        action: "GET_MY_LEAVES",
        leaves,
      });
    }

    // APPLY LEAVE
    if (aiResponse.action === "APPLY_LEAVE") {
      const { startDate, endDate, type, reason } = aiResponse.data;

      // Check balance before creating
      const leaveType = (type || "casual").toLowerCase() as
        | "casual"
        | "sick"
        | "paid";
      const start = new Date(startDate);
      const end = new Date(endDate);
      const requestedDays =
        Math.ceil(
          Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      const currentBalance = user.leaveBalance?.[leaveType] || 0;
      if (currentBalance < requestedDays) {
        return res.json({
          message: `You don't have enough ${leaveType} leave balance. You requested ${requestedDays} day(s) but only have ${currentBalance} remaining.`,
          action: "NONE",
        });
      }

      const newLeave = await Leave.create({
        employeeId: user._id,
        startDate: start,
        endDate: end,
        type: leaveType,
        reason: reason || "Applied via WorkSync AI",
        status: "pending",
      });

      const populatedLeave = await newLeave.populate("employeeId", "name email");

      return res.json({
        message: `Done! Your ${leaveType} leave from ${start.toDateString()} to ${end.toDateString()} has been submitted for approval.`,
        action: "APPLY_LEAVE",
        leave: populatedLeave,
      });
    }

    // CANCEL LEAVE
    if (aiResponse.action === "CANCEL_LEAVE") {
      const { date } = aiResponse.data;
      const targetDate = new Date(date);

      // Find the closest pending leave around that date
      const pendingLeave = await Leave.findOne({
        employeeId: user._id,
        status: "pending",
        startDate: {
          $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), 1),
          $lte: new Date(
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
            0
          ),
        },
      }).sort({ startDate: 1 });

      if (!pendingLeave) {
        return res.json({
          message: `I couldn't find any pending leave around ${targetDate.toDateString()}. Only pending leaves can be cancelled.`,
          action: "NONE",
        });
      }

      await Leave.findByIdAndDelete(pendingLeave._id);

      return res.json({
        message: `Your ${pendingLeave.type} leave (${new Date(pendingLeave.startDate).toDateString()} – ${new Date(pendingLeave.endDate).toDateString()}) has been cancelled successfully.`,
        action: "CANCEL_LEAVE",
      });
    }

    // MY ATTENDANCE SUMMARY
    if (aiResponse.action === "MY_ATTENDANCE_SUMMARY") {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const records = await Attendance.find({
        employeeId: user._id,
        date: { $gte: monthStart, $lte: monthEnd },
      });

      const presentDays = records.filter((r) => r.status === "Present").length;
      const lateDays = records.filter((r) => r.status === "Late").length;
      const totalHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
      const avgHours =
        records.length > 0 ? (totalHours / records.length).toFixed(1) : "0";

      return res.json({
        message: `Here's your attendance for ${now.toLocaleString("default", { month: "long" })}:`,
        action: "MY_ATTENDANCE_SUMMARY",
        attendanceSummary: {
          present: presentDays,
          late: lateDays,
          totalRecords: records.length,
          totalHours: totalHours.toFixed(1),
          avgHoursPerDay: avgHours,
          month: now.toLocaleString("default", { month: "long", year: "numeric" }),
        },
      });
    }

    // MY PROFILE
    if (aiResponse.action === "MY_PROFILE") {
      const emp = await Employee.findById(empId).populate(
        "managerId",
        "name designation"
      );
      if (!emp) {
        return res.json({
          message: "I couldn't find your profile details. Please contact HR.",
          action: "NONE",
        });
      }

      const manager = emp.managerId as any;

      return res.json({
        message: `Here's your profile information:`,
        action: "MY_PROFILE",
        profile: {
          name: emp.name,
          department: emp.department || "Not assigned",
          designation: emp.designation || "Not assigned",
          employeeCode: emp.employeeCode,
          workLocation: emp.workLocation,
          status: emp.status,
          joiningDate: emp.joiningDate
            ? new Date(emp.joiningDate).toDateString()
            : "Not set",
          manager: manager?.name || "Not assigned",
          managerDesignation: manager?.designation || "",
        },
      });
    }

    // ─────────────────────────────────────────────
    // ADMIN / MANAGER ACTIONS
    // ─────────────────────────────────────────────

    // LEAVES ON DATE
    if (aiResponse.action === "LEAVES_ON_DATE") {
      if (user.role === "employee") {
        return res.json({
          message: "Sorry, only admins and managers can view team leave information.",
          action: "NONE",
        });
      }

      const { date } = aiResponse.data;
      const targetDate = new Date(date);
      const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

      const leaves = await Leave.find({
        startDate: { $lte: dayEnd },
        endDate: { $gte: dayStart },
        status: { $in: ["approved", "Approved"] },
      }).populate("employeeId", "name email");

      // Get department info for each user
      const leavesWithDept = await Promise.all(
        leaves.map(async (leave) => {
          const leaveUser = leave.employeeId as any;
          const emp = await Employee.findOne({ email: leaveUser?.email }).select(
            "department designation"
          );
          return {
            name: leaveUser?.name || "Unknown",
            email: leaveUser?.email || "",
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            department: emp?.department || "N/A",
            designation: emp?.designation || "N/A",
          };
        })
      );

      const queryDateStr = new Date(date).toDateString();
      return res.json({
        message:
          leaves.length > 0
            ? `${leaves.length} employee(s) are on approved leave on ${queryDateStr}.`
            : `No employees are on approved leave on ${queryDateStr}.`,
        action: "LEAVES_ON_DATE",
        leavesOnDate: leavesWithDept,
        queryDate: queryDateStr,
      });
    }

    // DEPARTMENT LEAVE SUMMARY
    if (aiResponse.action === "DEPT_LEAVE_SUMMARY") {
      if (user.role === "employee") {
        return res.json({
          message: "This information is only available to admins and managers.",
          action: "NONE",
        });
      }

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const leaves = await Leave.find({
        appliedAt: { $gte: monthStart, $lte: monthEnd },
      }).populate("employeeId", "name email");

      // Map each leave to a department
      const deptMap: Record<string, number> = {};
      await Promise.all(
        leaves.map(async (leave) => {
          const leaveUser = leave.employeeId as any;
          const emp = await Employee.findOne({
            email: leaveUser?.email,
          }).select("department");
          const dept = emp?.department || "Unknown";
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        })
      );

      const deptSummary = Object.entries(deptMap)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);

      return res.json({
        message: `Here's the department-wise leave summary for ${now.toLocaleString("default", { month: "long" })}:`,
        action: "DEPT_LEAVE_SUMMARY",
        deptSummary,
        month: now.toLocaleString("default", { month: "long", year: "numeric" }),
      });
    }

    // PENDING APPROVALS
    if (aiResponse.action === "PENDING_APPROVALS") {
      if (user.role === "employee") {
        return res.json({
          message: "Only admins and managers can view pending approvals.",
          action: "NONE",
        });
      }

      const pending = await Leave.find({
        status: "pending",
      })
        .populate("employeeId", "name email")
        .sort({ appliedAt: -1 });

      const pendingWithDept = await Promise.all(
        pending.map(async (leave) => {
          const leaveUser = leave.employeeId as any;
          const emp = await Employee.findOne({
            email: leaveUser?.email,
          }).select("department");
          return {
            _id: leave._id,
            name: leaveUser?.name || "Unknown",
            email: leaveUser?.email || "",
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            appliedAt: leave.appliedAt,
            department: emp?.department || "N/A",
          };
        })
      );

      return res.json({
        message:
          pending.length > 0
            ? `There are ${pending.length} leave request(s) pending approval.`
            : "No pending leave requests at the moment.",
        action: "PENDING_APPROVALS",
        pendingLeaves: pendingWithDept,
      });
    }

    // TODAY'S ABSENTEES
    if (aiResponse.action === "TODAYS_ABSENTEES") {
      if (user.role === "employee") {
        return res.json({
          message: "Only admins and managers can view attendance data.",
          action: "NONE",
        });
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Get all active users
      const allUsers = await User.find({ isActive: true, role: "employee" }).select(
        "name email employeeId"
      );

      // Get users who checked in today
      const presentRecords = await Attendance.find({
        date: { $gte: todayStart, $lte: todayEnd },
      }).select("employeeId");

      const presentIds = new Set(
        presentRecords.map((r) => r.employeeId.toString())
      );

      const absentees = allUsers.filter(
        (u) => !presentIds.has(u._id.toString())
      );

      // Enrich with department info
      const absenteesWithDept = await Promise.all(
        absentees.map(async (u) => {
          const emp = await Employee.findById(u.employeeId).select(
            "department designation"
          );
          return {
            name: u.name,
            email: u.email,
            department: emp?.department || "N/A",
            designation: emp?.designation || "N/A",
          };
        })
      );

      return res.json({
        message:
          absentees.length > 0
            ? `${absentees.length} employee(s) have not checked in today.`
            : "Great news! All employees have checked in today.",
        action: "TODAYS_ABSENTEES",
        absentees: absenteesWithDept,
      });
    }

    // SEARCH EMPLOYEE
    if (aiResponse.action === "SEARCH_EMPLOYEE") {
      if (user.role === "employee") {
        return res.json({
          message: "Only admins and managers can search employee profiles.",
          action: "NONE",
        });
      }

      const { name } = aiResponse.data;
      const emp = await Employee.findOne({
        name: { $regex: name, $options: "i" },
      }).populate("managerId", "name designation");

      if (!emp) {
        return res.json({
          message: `I couldn't find an employee named "${name}". Please check the name and try again.`,
          action: "NONE",
        });
      }

      const manager = emp.managerId as any;
      const userAccount = await User.findOne({ employeeId: emp._id }).select(
        "isActive leaveBalance role"
      );

      return res.json({
        message: `Here's the profile for ${emp.name}:`,
        action: "SEARCH_EMPLOYEE",
        employeeProfile: {
          name: emp.name,
          employeeCode: emp.employeeCode,
          department: emp.department || "N/A",
          designation: emp.designation || "N/A",
          workLocation: emp.workLocation,
          status: emp.status,
          joiningDate: emp.joiningDate
            ? new Date(emp.joiningDate).toDateString()
            : "Not set",
          manager: manager?.name || "Not assigned",
          managerDesignation: manager?.designation || "",
          isActive: userAccount?.isActive ?? true,
          role: userAccount?.role || "employee",
          leaveBalance: userAccount?.leaveBalance || {
            casual: 0,
            sick: 0,
            paid: 0,
          },
        },
      });
    }

    // APPROVE LEAVE
    if (aiResponse.action === "APPROVE_LEAVE") {
      if (user.role === "employee") {
        return res.json({
          message: "Only admins and managers can approve leave requests.",
          action: "NONE",
        });
      }

      const { employeeName } = aiResponse.data;
      const targetUser = await User.findOne({
        name: { $regex: employeeName, $options: "i" },
      });

      if (!targetUser) {
        return res.json({
          message: `I couldn't find an employee named "${employeeName}".`,
          action: "NONE",
        });
      }

      const pendingLeave = await Leave.findOne({
        employeeId: targetUser._id,
        status: "pending",
      }).sort({ appliedAt: -1 });

      if (!pendingLeave) {
        return res.json({
          message: `${targetUser.name} has no pending leave requests.`,
          action: "NONE",
        });
      }

      // Deduct balance
      const diffDays =
        Math.ceil(
          Math.abs(
            new Date(pendingLeave.endDate).getTime() -
              new Date(pendingLeave.startDate).getTime()
          ) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      await User.findByIdAndUpdate(targetUser._id, {
        $inc: {
          [`leaveBalance.${pendingLeave.type.toLowerCase()}`]: -diffDays,
        },
      });

      pendingLeave.status = "approved";
      await pendingLeave.save();

      return res.json({
        message: `✓ Approved! ${targetUser.name}'s ${pendingLeave.type} leave (${new Date(pendingLeave.startDate).toDateString()} – ${new Date(pendingLeave.endDate).toDateString()}) has been approved.`,
        action: "APPROVE_LEAVE",
      });
    }

    // REJECT LEAVE
    if (aiResponse.action === "REJECT_LEAVE") {
      if (user.role === "employee") {
        return res.json({
          message: "Only admins and managers can reject leave requests.",
          action: "NONE",
        });
      }

      const { employeeName } = aiResponse.data;
      const targetUser = await User.findOne({
        name: { $regex: employeeName, $options: "i" },
      });

      if (!targetUser) {
        return res.json({
          message: `I couldn't find an employee named "${employeeName}".`,
          action: "NONE",
        });
      }

      const pendingLeave = await Leave.findOne({
        employeeId: targetUser._id,
        status: "pending",
      }).sort({ appliedAt: -1 });

      if (!pendingLeave) {
        return res.json({
          message: `${targetUser.name} has no pending leave requests.`,
          action: "NONE",
        });
      }

      pendingLeave.status = "rejected";
      await pendingLeave.save();

      return res.json({
        message: `${targetUser.name}'s ${pendingLeave.type} leave (${new Date(pendingLeave.startDate).toDateString()} – ${new Date(pendingLeave.endDate).toDateString()}) has been rejected.`,
        action: "REJECT_LEAVE",
      });
    }

    // DEFAULT
    return res.json(aiResponse);
  } catch (err) {
    console.error("AI Controller Error:", err);
    res
      .status(500)
      .json({ error: "WorkSync AI is currently offline. Please try again later." });
  }
};