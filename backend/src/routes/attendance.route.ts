import { Router } from "express";
import {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
} from "../controllers/attendance.controllers";
import { requireRole } from "../middlewares/auth";

const router = Router();

// POST /api/attendance/mark
// Used by employees to check-in/out
router.post("/mark", requireRole(["employee", "admin", "manager"]), markAttendance);

// GET /api/attendance/my
// Used by employees to see their own history (the Mon/Tue log)
router.get("/my", requireRole(["employee", "admin", "manager"]), getMyAttendance);

// GET /api/attendance/all
// Used by HR/Admin to see everyone's logs
router.get("/all", requireRole(["admin", "manager"]), getAllAttendance);

// PUT /api/attendance/:id
// Used by Admin to correct a record if an employee forgets to check out
router.put("/:id", requireRole(["admin"]), updateAttendance);

export default router;