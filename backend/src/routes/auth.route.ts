import { Router } from "express";
import { getMe, login, logout } from "../controllers/auth.controllers";
import {requireRole } from "../middlewares/auth";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireRole(["admin", "employee", "manager"]), getMe);

export default router;
