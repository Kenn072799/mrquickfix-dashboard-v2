import axios from "axios";
import { create } from "zustand";

export const useJobOrderData = create((set) => ({
    projects: [],
    setProjects: (projects) => set({ projects }),

    // Add job order
    createProject: async (newJob) => {
        const userID = localStorage.getItem("userID");

        if (!userID) {
            console.error("User ID not found in localStorage. Please ensure the user is logged in.");
            return { success: false, message: "User is not authenticated" };
        }

        if (!newJob.clientFirstName || !newJob.clientLastName || !newJob.clientAddress || !newJob.jobType || newJob.jobServices.length === 0) {
            return { success: false, message: "Please fill in all required fields" };
        }

        try {
            const res = await axios.post("/api/job-orders", { ...newJob, createdBy: userID }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            set((state) => ({ projects: [...state.projects, res.data.data] }));
            return { success: true, message: "Project created successfully" };
        } catch (error) {
            console.error("Error saving job order:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "An error occurred" };
        }
    },

    // Get job order
    fetchProjects: async () => {
        try {
            const res = await axios.get("/api/job-orders");
            set({ projects: res.data.data });
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    },

// Update job order in Zustand store
updateJobOrder: async (id, updatedJob) => {
    const userID = localStorage.getItem("userID");

    if (!userID) {
        console.error("User ID not found in localStorage. Please ensure the user is logged in.");
        return { success: false, message: "User ID is required" };
    }

    if (!updatedJob.clientFirstName || !updatedJob.clientLastName || !updatedJob.clientAddress || !updatedJob.jobInspectionDate || !updatedJob.jobType || updatedJob.jobServices.length === 0) {
        return { success: false, message: "Please fill in all required fields" };
    }

    try {
        const res = await axios.patch(`/api/job-orders/${id}`, { ...updatedJob, userID }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = res.data;

        if (!data.success) return { success: false, message: data.message };

        set((state) => ({
            projects: state.projects.map((project) => (project._id === id ? data.data : project)),
        }));
        return { success: true, message: "Job order updated successfully" };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "An error occurred" };
    }
},


updateInProgressJobOrder: async (id, updatedJob) => {
    const userID = localStorage.getItem("userID");

    console.log("User ID from localStorage:", userID);
    console.log("Updated job data:", updatedJob);

    if (!userID) {
        console.error("User ID not found in localStorage. Please ensure the user is logged in.");
        return { success: false, message: "User ID is required" };
    }

    if (!updatedJob.clientFirstName || !updatedJob.clientLastName || !updatedJob.clientAddress || !updatedJob.jobType || updatedJob.jobServices.length === 0) {
        console.error("Validation failed: missing required fields in updatedJob");
        return { success: false, message: "Please fill in all required fields" };
    }

    try {
        const payload = { ...updatedJob, updatedBy: userID };
        console.log("Payload sent to API:", payload);

        const res = await axios.patch(`/api/job-orders/${id}`, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = res.data;

        if (!data.success) return { success: false, message: data.message };

        set((state) => ({
            projects: state.projects.map((project) => (project._id === id ? data.data : project)),
        }));
        return { success: true, message: "Job order updated successfully" };
    } catch (error) {
        console.error("Error updating job order:", error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || "An error occurred" };
    }
},


// Alert job order Notification (for both "on process" and "in progress")
alertJobOrder: async (id, alertJobOrder) => {
    try {
        const userID = localStorage.getItem("userID");
        if (!userID) {
            console.error("User ID not found in localStorage. Cannot proceed with alertJobOrder.");
            return { success: false, message: "User ID is required to update the job notification alert" };
        }

        const updatedData = { 
            jobNotificationAlert: alertJobOrder.jobNotificationAlert,
            updatedBy: userID
        };

        console.log("Payload sent to alert job order API:", updatedData);

        const res = await axios.patch(`/api/job-orders/${id}`, updatedData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = res.data;

        if (!data.success) return { success: false, message: data.message };

        set(state => ({
            projects: state.projects.map(project => (project._id === id ? data.data : project)),
        }));

        return { success: true, message: "Job notification alert updated!" };
    } catch (error) {
        console.error("Error updating job notification alert:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.message || "Failed to update job notification alert" 
        };
    }
},


}));
