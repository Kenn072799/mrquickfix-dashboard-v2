import mongoose from "mongoose";
import JobOrder from "../models/joborder.mode.js";
import ProjectIDCounter from "../models/projectIDCounter.model.js";

// Add job order
export const addJobOrder = async (req, res) => {
    const job = req.body;
  
    try {
        let counter = await ProjectIDCounter.findOne();
  
        if (!counter) {
            counter = new ProjectIDCounter({ lastProjectID: 0 });
            await counter.save();
        }
  
        const newProjectID = `P${String(counter.lastProjectID + 1).padStart(7, '0')}`;
  
        await ProjectIDCounter.updateOne({}, { $inc: { lastProjectID: 1 } });
  
        job.projectID = newProjectID;

        if (job.createdBy && job.createdBy === "Client") {
            job.createdBy = null;
        } else if (job.createdBy && !mongoose.Types.ObjectId.isValid(job.createdBy)) {
            return res.status(400).json({ success: false, message: "Invalid createdBy ID" });
        }

        const newJob = new JobOrder(job);
        await newJob.save();
  
        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        console.error("Error saving job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to save job order" });
    }
};

// Get all job orders
export const getJobOrders = async (req, res) => {
    try {
        const jobs = await JobOrder.find({}).populate("createdBy updatedBy", "firstName lastName");
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error("Error fetching job orders:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to fetch job orders" });
    }
};

// Update job order
export const updateJobOrder = async (req, res) => {
    const { id } = req.params;
    const job = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Job order not found" });
    }

    const userID = job.userID;

    if (!userID) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }

    try {
        const updateFields = {
            ...job,
            updatedBy: userID,
            updatedAt: new Date(),
            jobNotificationRead: true,
        };

        if (job.jobStatus === "cancelled") {
            updateFields.jobCancelledDate = new Date();
        }

        if (job.jobStatus === "completed") {
            updateFields.jobCompletedDate = new Date();
        }

        if (updateFields.updatedBy === "Client") {
            updateFields.updatedBy = null;
        } else if (updateFields.updatedBy && !mongoose.Types.ObjectId.isValid(updateFields.updatedBy)) {
            return res.status(400).json({ success: false, message: "Invalid updatedBy ID" });
        }

        const updatedJob = await JobOrder.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        ).populate("createdBy updatedBy", "firstName lastName");

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }

        res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
        console.error("Error updating job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update job order" });
    }
};

// Delete job order
export const deleteJobOrder = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }
        
        await JobOrder.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Job order deleted successfully" });
    } catch (error) {
        console.error("Error deleting job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to delete job order" });
    }
};

// Archive job order
export const archiveJobOrder = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Job order not found" });
    }

    try {
        const jobOrder = await JobOrder.findById(id);
        if (!jobOrder) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }

        if (jobOrder.jobStatus === "completed" || jobOrder.jobStatus === "cancelled") {
            jobOrder.isArchived = true;
            jobOrder.archivedAt = new Date();
            await jobOrder.save();

            return res.status(200).json({ success: true, data: jobOrder });
        } else {
            return res.status(400).json({ success: false, message: "Only completed or cancelled jobs can be archived" });
        }
    } catch (error) {
        console.error("Error archiving job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to archive job order" });
    }
};
