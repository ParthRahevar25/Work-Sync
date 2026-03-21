import { Router } from "express";
import { getDashboardSummary, getDepartmentBreakdown, getTopPerformers, getWeeklyAttendance } from "../controllers/summary.controllers";
import { requireRole } from "../middlewares/auth";

const router = Router();

/**
 * 🔹 GET /api/dashboard/summary
 * Aggregates attendance, leaves, and late counts for the dashboard cards.
 * Restricted to Admin and Manager roles.
 */
router.get("/summary", requireRole(["admin", "manager"]), getDashboardSummary);
router.get("/weekly",   requireRole(["admin", "manager"]),   getWeeklyAttendance);
router.get("/departments", requireRole(["admin", "manager"]),getDepartmentBreakdown);
router.get("/performers", requireRole(["admin", "manager"]), getTopPerformers);

export default router;