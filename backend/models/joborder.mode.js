import mongoose from "mongoose";

// Define the job order schema
const joborderSchema = new mongoose.Schema({
    // Client Information
    clientFirstName: {
        type: String,
        required: true
    },
    clientLastName: {
        type: String,
        required: true
    },    
    clientAddress: {
        type: String,
        required: false
    },
    clientEmail: {
        type: String,
        required: false
    },
    clientPhone: {
        type: String,
        required: false
    },
    clientMessage: {
        type: String,
        required: false
    },
    clientInquiryDate: {
        type: Date, // Use Date type for dates
        required: false
    },
    // Job Information
    jobType: {
        type: String,
        required: false
    },
    jobServices: {
        type: [String], // Explicitly declare array of strings
        required: false
    },
    jobStatus: {
        type: String,
        required: false
    },
    jobInspectionDate: {
        type: Date, // Use Date type for dates
        required: false
    },
    jobQuotation: {
        type: String,
        required: false
    },
    jobStartDate: {
        type: Date, // Use Date type for dates
        required: false
    },
    jobEndDate: {
        type: Date, // Use Date type for dates
        required: false
    },
    jobNotificationAlert: {
        type: String,
        required: false
    },
    jobCancelledDate: {
        type: Date, // Use Date type for dates
        required: false
    },
    jobRemark: {
        type: String,
        required: false
    },
    // References to Admin
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create the model
const JobOrder = mongoose.model("JobOrder", joborderSchema);

export default JobOrder;
