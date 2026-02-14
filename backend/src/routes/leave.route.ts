import { Router } from "express";
import { applyLeave, getAllLeaves, getMyLeaves, updateLeaveStatus } from "../controllers/leave.controllers";
import { requireRole } from "../middlewares/auth";

const router = Router();

// Employees can apply
router.post("/apply", requireRole(["employee", "admin", "manager"]), applyLeave);

// Admins/Managers can see all and update
router.get("/all", requireRole(["admin", "manager"]), getAllLeaves);
router.put("/update/:id", requireRole(["admin"]), updateLeaveStatus);
router.get("/my", requireRole(["employee", "admin", "manager"]), getMyLeaves);

export default router;