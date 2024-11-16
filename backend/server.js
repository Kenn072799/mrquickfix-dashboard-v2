import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./router/auth.router.js";
import jobOrderRoutes from "./router/joborder.route.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_WEBSITE].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true 
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/job-orders", jobOrderRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});
