import express from "express";
import dotenv from "dotenv";
import cors from "cors";  
import connectDB from "./config/db";
import testRoutes from "./routes/test.route";
import employeeRoutes from "./routes/employee.route";
import authRoutes from "./routes/auth.route";
import roleRoutes from "./routes/role.route";
import attendanceRoutes from "./routes/attendance.route";
import userRoutes from "./routes/user.route";

dotenv.config();
connectDB();

const app = express();
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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
