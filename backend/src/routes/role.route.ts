import { Router } from "express";
import { createRole } from "../controllers/role.controllers";
import { requireRole } from "../middlewares/auth";

const router = Router();

router.post(
  "/",
  requireRole(["admin"]),
  createRole
);

export default router;
