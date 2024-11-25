import express from 'express';

import { addJobOrder, getJobOrders, updateJobOrder, deleteJobOrder, archiveJobOrder, updateJobOrderNote } from "../controllers/joborder.controller.js";

const router = express.Router();

// Add job order
router.post("/", addJobOrder);

// Get all job orders
router.get("/", getJobOrders);

// Update job order
router.patch("/:id", updateJobOrder);


// Delete job order
router.delete("/:id", deleteJobOrder);

// Archive job order
router.patch("/:id", archiveJobOrder);

// Note
router.patch("/note/:id", updateJobOrderNote);


export default router;