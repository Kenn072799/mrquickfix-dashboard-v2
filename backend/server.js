import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import jobOrderRoutes from "./router/joborder.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Parse JSON request bodies

app.use("/api/job-orders", jobOrderRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});