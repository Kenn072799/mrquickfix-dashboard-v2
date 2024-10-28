import axios from "axios";
import { create } from "zustand";

export const useJobOrderData = create((set) => ({
    projects: [],
    setProjects: (projects) => set({ projects }),
    // Add job order
    createProject: async (newJob) => {
        if (!newJob.clientFirstName || !newJob.clientLastName || !newJob.clientAddress || !newJob.jobType || newJob.jobServices.length === 0) {
            return { success: false, message: "Please fill in all required fields" };
        }

        try {
            const res = await axios.post("/api/job-orders", newJob, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            set((state) => ({ projects: [...state.projects, res.data.data] }));
            return { success: true, message: "Project created successfully" };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "An error occurred" };
        }
    },
    // get job order
    fetchProjects: async () => {
        try {
            const res = await axios.get("/api/job-orders");
            set({ projects: res.data.data });
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    },
     // Update job order for on process status
    updateJobOrder: async (id, updatedJob) => {
        if (!updatedJob.clientFirstName || !updatedJob.clientLastName || !updatedJob.clientAddress || !updatedJob.jobInspectionDate || !updatedJob.jobType || updatedJob.jobServices.length === 0) {
            return { success: false, message: "Please fill in all required fields" };
        }

        try {
            const res = await axios.patch(`/api/job-orders/${id}`, updatedJob, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = res.data;
    
            if (!data.success) return { success: false, message: data.message };
    
            // Update project without re-rendering the whole component
            set(state => ({
                projects: state.projects.map(project => (project._id === id ? data.data : project)),
            }));
            return { success: true, message: "Job order updated successfully" };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "An error occurred" };
        }
    },
        // Update job order for in progress status
        updateInProgressJobOrder: async (id, updatedJob) => {
            if (!updatedJob.clientFirstName || !updatedJob.clientLastName || !updatedJob.clientAddress || !updatedJob.jobType || updatedJob.jobServices.length === 0) {
                return { success: false, message: "Please fill in all required fields" };
            }
    
            try {
                const res = await axios.patch(`/api/job-orders/${id}`, updatedJob, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = res.data;
    
                if (!data.success) return { success: false, message: data.message };
    
                set(state => ({
                    projects: state.projects.map(project => (project._id === id ? data.data : project)),
                }));
                return { success: true, message: "Job order updated successfully" };
            } catch (error) {
                return { success: false, message: error.response?.data?.message || "An error occurred" };
            }
        },

        // Alert job order Notification (for both "on process" and "in progress")
        alertJobOrder: async (id, alertJobOrder) => { 
            try {
                // 1. Prepare data to be updated 
                const updatedData = { 
                    jobNotificationAlert: alertJobOrder.jobNotificationAlert 
                };

                // 2. Make API request to update
                const res = await axios.patch(`/api/job-orders/${id}`, updatedData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = res.data;

                if (!data.success) return { success: false, message: data.message };

                // 3. Update the Zustand store
                set(state => ({
                    projects: state.projects.map(project => (project._id === id ? data.data : project)),
                }));

                return { success: true, message: "Job notification alert updated!" };
            } catch (error) {
                return { success: false, message: error.response?.data?.message || "Failed to update job notification alert" };
            }
        },
}));