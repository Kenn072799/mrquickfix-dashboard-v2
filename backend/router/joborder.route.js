import express from 'express';

import { addJobOrder, getJobOrders, updateJobOrder, deleteJobOrder } from "../controllers/joborder.controller.js";

const router = express.Router();

// Add job order
router.post("/", addJobOrder);

// Get all job orders
router.get("/", getJobOrders);

// Update job order
router.patch("/:id", updateJobOrder);


// Delete job order
router.delete("/:id", deleteJobOrder);


export default router;