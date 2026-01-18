import { Request, Response } from "express";
import Employee from "../models/Employee.model";

export const createTestEmployee = async (req: Request, res: Response) => {
  try {
    const emp = await Employee.create({
      name: "Parth",
      email: "parth@worksync.com",
    //   password: "hashed_password",
      role: "employee",
      department: "Engineering",
    });

    res.status(201).json({
      message: "Employee created",
      data: emp,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
