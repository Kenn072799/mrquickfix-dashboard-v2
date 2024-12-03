import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./router/auth.router.js";
import jobOrderRoutes from "./router/joborder.route.js";
import serviceRoute from "./router/services.router.js";
import projectRoute from "./router/project.router.js";
import testimonialRoute from "./router/testimonial.router.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

app.get('/', (req, res) => {
  let date = new Date();
  date = date.toDateString()
   res.send(date+"");
  
});

app.use("/api/job-orders", jobOrderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services",serviceRoute);
app.use("/api/projects", projectRoute);
app.use("/api/testimonial", testimonialRoute);

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});
