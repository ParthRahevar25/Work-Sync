import express from "express";
import dotenv from "dotenv";
import cors from "cors";  
import connectDB from "./config/db";
import employeeRoutes from "./routes/employee.route";
import authRoutes from "./routes/auth.route";
import roleRoutes from "./routes/role.route";
import attendanceRoutes from "./routes/attendance.route";
import userRoutes from "./routes/user.route";
import leaveRoutes from "./routes/leave.route";
import cookieParser from "cookie-parser";
import dashboardRoutes from "./routes/summary.route"; // 👈 Dashboard summary route

dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true
}));
app.use("/api/auth", authRoutes);


app.use("/api/employee", employeeRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
