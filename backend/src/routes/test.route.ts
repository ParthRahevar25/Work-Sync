import { Router } from "express";
import { createTestEmployee } from "../controllers/test.controllers";

const router = Router();

router.post("/create-employee", createTestEmployee);

export default router;
