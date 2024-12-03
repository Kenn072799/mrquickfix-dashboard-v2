import express from 'express';

import { addJobOrder, getJobOrders, updateJobOrder, deleteJobOrder, archiveJobOrder,File_Storage, addJobOrderNoFileUpload, updateJobOrderAddQuotationOnly, updateJobOrderNote, updateInquiryStatus } from "../controllers/joborder.controller.js";
import multer from 'multer';

const router = express.Router();
const upload = multer({storage:File_Storage})
// Add job order
router.post("/",upload.single("jobQuotation"),addJobOrder);
router.post("/savenofile",addJobOrderNoFileUpload);

// Get all job orders
router.get("/", getJobOrders);

// Update job order
router.patch("/:id", upload.single("jobQuotation"), updateJobOrder);
router.patch("/:id/updateQuotation",upload.single("jobQuotation"), updateJobOrderAddQuotationOnly);
router.patch("/:id/inquiry", updateInquiryStatus);

// Delete job order
router.delete("/:id", deleteJobOrder);

// Archive job order
router.patch("/:id/archive", archiveJobOrder);

// Note
router.patch("/note/:id", updateJobOrderNote);

export default router;