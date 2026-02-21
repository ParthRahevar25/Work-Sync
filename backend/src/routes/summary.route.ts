import { Router } from "express";
import { getDashboardSummary } from "../controllers/summary.controllers";
import { requireRole } from "../middlewares/auth"; // Using your reference naming

const router = Router();

/**
 * 🔹 GET /api/dashboard/summary
 * Aggregates attendance, leaves, and late counts for the dashboard cards.
 * Restricted to Admin and Manager roles.
 */
router.get("/summary", requireRole(["admin", "manager"]), getDashboardSummary);

export default router;