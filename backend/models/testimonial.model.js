import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
    status: {
        type: String,
        required: false,
    },
    feedbackMessage: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number between 1 and 5'
        }
    },
    jobID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "JobOrder", 
        required: false 
    },
    testimonialNotificationRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Testimonials = mongoose.model("testimonials", testimonialSchema);
export default Testimonials;