import { Request, Response } from "express";
import Employee from "../models/Employee.model";
import User from "../models/User.model";

// Create new employee (Admin only)
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeCode, name, department, designation, email, role, managerId, joiningDate } = req.body;

    const employee = new Employee({
      employeeCode,
      name,
      department,
      designation,
      email,
      role,
      managerId,
      joiningDate,
    });

    const saved = await employee.save();

    res.status(201).json({
      message: "Employee created",
      data: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

// Get all employees (Admin + Manager)
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// Get single employee (Admin / Manager / Self)

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id)
      .populate("managerId", "name designation") // Get manager info
      .lean(); // Faster, returns plain JSON

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Link the user account status to the employee data
    const userAccount = await User.findOne({ employeeId: id }).select("isActive role");

    res.json({
      ...employee,
      accountInfo: userAccount
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch 360 view" });
  }
};

// Update employee (Admin / Self)
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const employee = await Employee.findByIdAndUpdate(id, updates, { new: true });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.json({
      message: "Employee updated",
      data: employee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

// Delete employee (Admin only)
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Employee not found" });

    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};
