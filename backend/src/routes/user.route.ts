import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  toggleUserStatus,
} from "../controllers/user.controllers";
import { requireRole } from "../middlewares/auth";

const router = Router();

// Admin only
router.post("/", requireRole(["admin"]), createUser);

// Admin / Manager
router.get("/", requireRole(["admin", "manager"]), getAllUsers);
router.get("/:id", requireRole(["admin", "manager"]), getUserById);

// Admin only
router.patch(
  "/:id/toggle-status",
  requireRole(["admin"]),
  toggleUserStatus
);

export default router;
