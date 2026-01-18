import { Router } from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controllers";

import { requireRole } from "../middlewares/auth";

const router = Router();

// Admin only
router.post("/", requireRole(["admin"]), createEmployee);

// Admin + Manager
router.get("/", requireRole(["admin", "manager"]), getAllEmployees);
router.get("/:id", requireRole(["admin", "manager", "employee"]), getEmployeeById);

// Admin or Self
router.put("/:id", requireRole(["admin", "employee"]), updateEmployee);

// Admin only
router.delete("/:id", requireRole(["admin"]), deleteEmployee);

export default router;
