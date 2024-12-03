import mongoose from "mongoose";
import Testimonials from "../models/testimonial.model.js";
import JobOrder from "../models/joborder.mode.js";

// @desc Add new testimonial
// @route POST /api/testimonials
export const AddFeedback = async(req,res)=>{
    const {id} = req.params;
    const feedback = req.body;

    try{
        let checkJobOrder = await JobOrder.find({_id:id});
       
        if(!checkJobOrder) return res.status(400).json({message:
            'Invalid Job Order ID'
        })
     
        let checkTestimony = await Testimonials.findOne({jobID:id});
        if(checkTestimony) return res.status(400).json({message:
                'Already Submitted Feedback'
            })
      
        
        feedback.status = 'Draft';
        feedback.jobID = id;
        // console.log(feedback)
        const newFeedback = new Testimonials(feedback);
        await newFeedback.save();
        res.status(201).json({ success: true, message:newFeedback});
    }
    catch(error){
        console.error("Error saving service:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to save service" });
    }
}

// @desc Get all feedback
// @route GET /api/testimonials
export const getFeedback = async(req,res)=>{
    try {
        const jobs = await Testimonials.find({}).populate("jobID", "clientFirstName clientLastName");
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error("Error fetching job orders:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to fetch job orders" });
    }
}

// @desc Update testimonial status
// @route PATCH /api/testimonials/:id
export const updateStatus = async(req,res)=>{
    const {id} = req.params;
    const feedback = req.body;

    try{
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({ success: false, message: "Testimonial not found" });
        }
        const updateTestimonial = await Testimonials.findByIdAndUpdate(
            id,
            feedback,
            {new: true}
        ).populate("jobID", "clientFirstName clientLastName")
        
        if (!updateTestimonial) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }
        res.status(200).json({ success: true, data: updateTestimonial });
    }
    catch(error){
        console.error("Error updating testimonia:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update testimonial status" });
    }
}

// @desc Update testimonial notification status
// @route PATCH /api/testimonials/:id
export const updateNotificationRead = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Testimonial not found" });
        }

        const testimonial = await Testimonials.findByIdAndUpdate(
            id,
            { testimonialNotificationRead: true },
            { new: true }
        ).populate("jobID", "clientFirstName clientLastName");

        if (!testimonial) {
            return res.status(404).json({ success: false, message: "Testimonial not found" });
        }

        res.status(200).json({ success: true, data: testimonial });
    } catch (error) {
        console.error("Error updating testimonial notification:", error);
        res.status(500).json({ success: false, message: "Server Error: Failed to update notification status" });
    }
};