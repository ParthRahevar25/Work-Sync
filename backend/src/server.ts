import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import testRoutes from "./routes/test.route";
import employeeRoutes from "./routes/employee.route";
import authRoutes from "./routes/auth.route";




dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);


app.use("/api/employee", employeeRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
