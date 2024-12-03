import axios from "axios";
import { create } from "zustand";

export const useTestimonialData = create((set) => ({
    testimonials: [] || '',
    setTestimonial: (testimonials) => set({ testimonials }),

    // Add job order with file quotation 
    createTestimonial: async(id,newJob) => {
        // const userID = localStorage.getItem("userID");
        // if (!userID) {
        //     console.error("User ID not found in localStorage. Please ensure the user is logged in.");
        //     return { success: false, message: "User is not authenticated" };
        // }
     
                try {
                    const res = await axios.post(`/api/testimonial/save/${id}`, newJob, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    set((state) => ({ testimonials: [...state.testimonials, res.data.data] }));
                    return { success: true, message: "Feedback created successfully" };
                }

                catch (error) {
                    console.error("Error saving feedback:", error.response?.data?.message || error.message);
                    return { success: false, message: error.response?.data?.message || "An error occurred" };
                }
            
        
    },
    fetchTestimonialData: async () => {
        try {
            const res = await axios.get("/api/testimonial/");
            const fetchTestimonial = res.data.data || [];
            set({ testimonials: fetchTestimonial });
            return fetchTestimonial;
        } catch (error) {
            console.error("Failed to fetch testimonials:", error);
            throw new Error(
                error.response?.data?.message || "An error occurred while fetching testimonials."
            );
        }
    },
    updateTestimonialStatus: async(id,updateStatus)=>{
        try{
            const res = await axios.patch(`/api/testimonial/newStatus/${id}`,updateStatus, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = res.data;
            if (!data.success) return { success: false, message: data.message };
            set((state) => ({
                testimonials: state.testimonials.map((testimonial) =>
                    testimonial.id === id ? res.data.data : testimonial
                ),
            }));
            return { success: true, message: "Testimonial Status updated successfully" };
        }
        catch(error){
            console.error("Error updating job order:", error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || "An error occurred" };
        }
    },
    updateTestimonialNotificationRead: async (id) => {
        try {
            const res = await axios.patch(`/api/testimonial/notification/${id}`, {
                testimonialNotificationRead: true
            });
            
            if (!res.data.success) {
                return { success: false, message: res.data.message };
            }

            set((state) => ({
                testimonials: state.testimonials.map((testimonial) =>
                    testimonial._id === id 
                        ? { ...testimonial, testimonialNotificationRead: true }
                        : testimonial
                ),
            }));

            return { success: true };
        } catch (error) {
            console.error("Error updating testimonial notification:", error);
            return { success: false, message: error.response?.data?.message || "An error occurred" };
        }
    }
}));