import mongoose from "mongoose";
import JobOrder from "../models/joborder.mode.js";

// Add job order
export const addJobOrder = async (req, res) => {
    const job = req.body;

    const newJob = new JobOrder(job);

    try {
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

    console.log("User ID from request:", userID);

    if (!userID) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }

    try {
        const updatedJob = await JobOrder.findByIdAndUpdate(
            id,
            { ...job, updatedBy: userID, updatedAt: new Date() },
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
