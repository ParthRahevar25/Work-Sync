import { Router } from "express";
import { chatWithAI } from "./ai.controllers";
import { requireRole } from "../middlewares/auth";

const router = Router();

router.post(
  "/chat",
  requireRole(["employee", "admin", "manager"]),
  chatWithAI
);

export default router;