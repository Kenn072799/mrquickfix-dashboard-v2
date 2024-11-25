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

    // Get all job orders
    fetchProjects: async () => {
        try {
            const res = await axios.get("/api/job-orders");
            set({ projects: res.data.data });
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    },

    // Update job order
    updateJobOrder: async (id, updatedJob) => {
        const userID = localStorage.getItem("userID");

        if (!userID) {
            console.error("User ID not found in localStorage. Please ensure the user is logged in.");
            return { success: false, message: "User ID is required" };
        }

        if (!updatedJob.clientFirstName || !updatedJob.clientLastName || !updatedJob.clientAddress || !updatedJob.jobType || updatedJob.jobServices.length === 0) {
            return { success: false, message: "Please fill in all required fields" };
        }

        try {
            const payload = {
                ...updatedJob,
                userID: userID,
                updatedBy: userID,
            };

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

    // Update job order for in-progress status
    updateInProgressJobOrder: async (id, updatedJob) => {
        const userID = localStorage.getItem("userID");

        if (!userID) {
            return { success: false, message: "User ID is required" };
        }

        if (!updatedJob.clientFirstName || !updatedJob.clientLastName || !updatedJob.clientAddress || !updatedJob.jobType || updatedJob.jobServices.length === 0) {
            console.error("Validation failed: missing required fields in updatedJob");
            return { success: false, message: "Please fill in all required fields" };
        }

        try {
            const payload = { ...updatedJob, updatedBy: userID };

            const res = await axios.patch(`/api/job-orders/${id}`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = res.data;

            if (!data.success) return { success: false, message: data.message };

            set((state) => ({ projects: [...state.projects, res.data.data] }));
            return { success: true, message: "Job order updated successfully" };
        } catch (error) {
            console.error("Error updating job order:", error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || "An error occurred" };
        }
    },

    // Alert job order Notification (for both "on process" and "in progress")
    alertJobOrder: async (id, alertJobOrder) => {
        const userID = localStorage.getItem("userID");
        if (!userID) {
            console.error("User ID not found in localStorage. Cannot proceed with alertJobOrder.");
            return { success: false, message: "User ID is required to update the job notification alert" };
        }

        const updatedData = { 
            jobNotificationAlert: alertJobOrder.jobNotificationAlert,
            userID: userID 
        };

        try {
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

    // Archive job order
    archiveJobOrder: async (id) => {
        try {
            const res = await axios.patch(`/api/job-orders/${id}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = res.data;
    
            if (!data.success) return { success: false, message: data.message };
    
            set((state) => ({
                projects: state.projects.map((project) => 
                    project._id === id ? { ...project, isArchived: true, archivedAt: new Date() } : project
                ),
            }));
            return { success: true, message: "Job order archived successfully" };
        } catch (error) {
            console.error("Error archiving job order:", error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || "An error occurred" };
        }
    },

    // Update Notification Read
    updateNotificationRead: async (projectId) => {
        const userID = localStorage.getItem("userID");

        if (!userID) {
            console.error("User ID not found in localStorage. Cannot proceed with notification update.");
            return { success: false, message: "User ID is required" };
        }

        try {
            const res = await axios.patch(`/api/job-orders/${projectId}`, {
                jobNotificationRead: true,
                userID,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = res.data;

            if (!data.success) return { success: false, message: data.message };

            set((state) => ({
                projects: state.projects.map((project) =>
                    project._id === projectId ? data.data : project,
                ),
            }));

            return { success: true, message: "Notification marked as read" };
        } catch (error) {
            console.error("Error updating notification:", error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || "An error occurred",
            };
        }
    },

    // Update job order
    updateInquiryStatus: async (id, updatedJob) => {
        const userID = localStorage.getItem("userID");

        if (!userID) {
            console.error("User ID not found in localStorage. Please ensure the user is logged in.");
            return { success: false, message: "User ID is required" };
        }

        if (!updatedJob.clientFirstName || !updatedJob.clientLastName || !updatedJob.jobType || updatedJob.jobServices.length === 0) {
            return { success: false, message: "Please fill in all required fields" };
        }

        try {
            const payload = {
                ...updatedJob,
                userID: userID,
                updatedBy: userID,
            };

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

    // Delete job order
    deleteJobOrder: async (id) => {
        try {
            const res = await axios.delete(`/api/job-orders/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = res.data;

            if (!data.success) return { success: false, message: data.message };

            set((state) => ({
                projects: state.projects.filter((project) => project._id !== id),
            }));
            return { success: true, message: "Job order deleted successfully" };
        } catch (error) {
            console.error("Error deleting job order:", error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || "An error occurred" };
        }
    },

// Update job order note
updateJobOrderNote: async ({ jobOrderId, noteType, noteContent }) => {
    const userID = localStorage.getItem("userID");

    if (!userID) {
        console.error("User ID not found in localStorage.");
        return { success: false, message: "User ID is required to update a note." };
    }

    if (!["createdNote", "updatedNote"].includes(noteType)) {
        return { success: false, message: "Invalid note type. Must be 'createdNote' or 'updatedNote'." };
    }

    try {
        const res = await axios.patch(`/api/job-orders/note/${jobOrderId}`, {
            noteType,
            noteContent,
            userID,
        });

        const data = res.data;

        if (!data.success) return { success: false, message: data.message };

        set((state) => ({
            projects: state.projects.map((project) =>
                project._id === jobOrderId ? data.data : project
            ),
        }));

        return { success: true, message: "Note updated successfully" };
    } catch (error) {
        console.error("Error updating job order note:", error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to update job order note",
        };
    }
}

    

}));

