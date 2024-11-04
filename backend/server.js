import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import path from "path";

import authRoutes from "./router/auth.router.js";
import jobOrderRoutes from "./router/joborder.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true 
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/api/job-orders", jobOrderRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});
