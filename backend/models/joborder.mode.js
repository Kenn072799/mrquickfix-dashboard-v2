import mongoose from "mongoose";

const joborderSchema = new mongoose.Schema({
    // Project ID
    projectID: {
        type: String,
        required: false,
        unique: true,
    },
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
        type: Date,
        required: false
    },
    // Job Information
    jobType: {
        type: String,
        required: false
    },
    jobServices: {
        type: [String],
        required: false
    },
    jobStatus: {
        type: String,
        required: false
    },
    jobInspectionDate: {
        type: Date,
        required: false
    },
    jobQuotation: {
        type: String,
        required: false
    },
    jobStartDate: {
        type: Date, 
        required: false
    },
    jobEndDate: {
        type: Date,
        required: false
    },
    jobNotificationAlert: {
        type: String,
        required: false
    },
    jobNotificationRead: {
        type: Boolean,
        default: false
    },
    jobExtendedDate: {
        type: Date,
        required: false
    },
    jobCompletedDate: {
        type: Date,
        required: false
    },
    jobCancelledDate: {
        type: Date,
        required: false
    },
    jobCancellationReason: {
        type: String,
        required: false
    },
    jobPreviousStatus: {
        type: String,
        required: false
    },
    // Archiving Fields
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedAt: {
        type: Date,
        required: false
    },
    originalStatus: {
        type: String,
        required: false,
      },
    // References to Admin
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Admin", 
        required: false 
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Admin", 
        required: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const JobOrder = mongoose.model("JobOrder", joborderSchema);

export default JobOrder;
