import { Router } from "express";
import {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
} from "../controllers/attendance.controllers";
import { requireRole } from "../middlewares/auth";

const router = Router();

// Employee / Admin
router.post("/", requireRole(["employee", "admin"]), markAttendance);

// Employee
router.get("/me", requireRole(["employee"]), getMyAttendance);

// Admin / Manager
router.get("/", requireRole(["admin", "manager"]), getAllAttendance);

// Admin only
router.put("/:id", requireRole(["admin"]), updateAttendance);

export default router;
