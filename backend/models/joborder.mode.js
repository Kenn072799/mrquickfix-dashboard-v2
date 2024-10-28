import mongoose from "mongoose";

const joborderSchema = new mongoose.Schema({
    // client
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
        type: String,
        required: false
    },
    // job
    jobType: {
        type: String,
        required: false
    },
    jobServices: {
        type: Array,
        required: false
    },
    jobStatus: {
        type: String,
        required: false
    },
    jobInspectionDate: {
        type: String,
        required: false
    },
    jobQuotation: {
        type: String,
        required: false
    },
    jobStartDate: {
        type: String,
        required: false
    },
    jobEndDate: {
        type: String,
        required: false
    },
    jobNotificationAlert: {
        type: String,
        required: false
    },
    jobCancelledDate: {
        type: String,
        required: false
    },
    jobRemark: {
        type: String,
        required: false
    },
    // admin
    adminId: {
        type: String,
        required: false
    },
    adminFirstName: {
        type: String,
        required: false
    },
    adminLastName: {
        type: String,
        required: false
    }
}, {
    timestamps: true // createdAt & updatedAt
});

const JobOrder =  mongoose.model("JobOrder", joborderSchema);

export default JobOrder;
    