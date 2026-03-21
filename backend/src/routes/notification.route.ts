import { Router } from "express";
import { requireRole } from "../middlewares/auth";
import {
  getMyNotifications,
  markOneRead,
  markAllRead,
} from "../controllers/notification.controllers";

const router = Router();

// Every logged-in role can access their own notifications
router.get ("/my",       requireRole(["admin", "manager", "employee"]), getMyNotifications);
router.put ("/all/read", requireRole(["admin", "manager", "employee"]), markAllRead);
router.put ("/:id/read", requireRole(["admin", "manager", "employee"]), markOneRead);

export default router;