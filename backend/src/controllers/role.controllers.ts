import { Request, Response } from "express";
import Role from "../models/Role.model";

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json({ message: "Role created", data: role });
  } catch (error) {
    res.status(400).json({ error: "Role creation failed", details: error });
  }
};
