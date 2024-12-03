import axios from "axios";
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

// Helper functions
const checkUserStatus = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Authentication token is required");
  }
  
  const decoded = jwtDecode(token);
  if (decoded.adminStatus === "deactivated") {
    localStorage.clear();
    window.location.href = "/login-admin";
    throw new Error("Your account has been deactivated. Please contact the administrator.");
  }
  return true;
};

const getUserAuth = () => {
  const userID = localStorage.getItem("userID");
  if (!userID) {
    throw new Error("User ID is required");
  }

  checkUserStatus();
  return userID;
};

const validateJobOrder = (jobOrder) => {
  if (!jobOrder.clientFirstName || 
      !jobOrder.clientLastName || 
      !jobOrder.clientAddress || 
      !jobOrder.jobType || 
      jobOrder.jobServices.length === 0) {
    throw new Error("Please fill in all required fields");
  }
};

export const useJobOrderData = create((set) => ({
    projects: [],
    loading: false,
    error: null,
    
    setProjects: (projects) => set({ projects }),

    // Create job order with file quotation
    createProject: async (newJob) => {
        try {
            const userID = getUserAuth();
            
            // Handle FormData validation
            if (newJob instanceof FormData) {
                for (let [name, value] of newJob.entries()) {
                    if (["clientFirstName", "clientLastName", "clientAddress", "jobType", "jobServices"].includes(name)) {
                        if (!value) {
                            throw new Error("Please fill in all required fields");
                        }
                    }
                }
            }

            const res = await axios.post("/api/job-orders/", newJob, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            set((state) => ({ projects: [...state.projects, res.data.data] }));
            return { success: true, message: "Project created successfully" };
        } catch (error) {
            console.error("Error saving job order:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message 
            };
        }
    },

    // Create job order without file
    createProjectOnProcess: async (newJob) => {
        try {
            const userID = getUserAuth();
            validateJobOrder(newJob);

            const res = await axios.post("/api/job-orders/savenofile", 
                { ...newJob, createdBy: userID },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            set((state) => ({ projects: [...state.projects, res.data.data] }));
            return { success: true, message: "Project created successfully" };
        } catch (error) {
            console.error("Error saving job order:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message 
            };
        }
    },

    // Update job order with quotation
    updateJobOrderAddQuotation: async (id, updatedJob) => {
        try {
            const userID = getUserAuth();

            // Validate quotation file
            if (updatedJob instanceof FormData) {
                const quotation = updatedJob.get("jobQuotation");
                if (!quotation) {
                    throw new Error("Please provide a quotation file");
                }

                // Validate file type
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!allowedTypes.includes(quotation.type)) {
                    throw new Error("Invalid file type. Please upload a PDF or Word document.");
                }

                // Validate file size (10MB limit)
                if (quotation.size > 10 * 1024 * 1024) {
                    throw new Error("File size exceeds 10MB limit");
                }
            }

            const res = await axios.patch(`/api/job-orders/${id}/updateQuotation`, 
                updatedJob,
                {
                    headers: { 
                        "Content-Type": "multipart/form-data"
                    },
                    timeout: 30000 // 30 second timeout for large files
                }
            );

            if (!res.data?.success) {
                throw new Error(res.data?.message || "Failed to update quotation");
            }

            set((state) => ({
                projects: state.projects.map((project) => 
                    project._id === id ? res.data.data : project
                )
            }));

            return { 
                success: true, 
                message: "Job order updated successfully",
                data: res.data.data
            };
        } catch (error) {
            console.error("Error updating job order:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message 
            };
        }
    },

    // @desc Fetch all job orders
    // API ENDPOINT: GET /api/job-orders
    fetchProjects: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/api/job-orders");
            set({ projects: res.data.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            set({ loading: false, error: error.message });
        }
    },

    // @desc Update job order
    // API ENDPOINT: PATCH /api/job-orders/:id
    updateJobOrder: async (id, updatedJob) => {
        try {
            const userID = getUserAuth();
            
            let payload;
            let headers;
            
            // Check if updatedJob is FormData (has file) or regular object
            if (updatedJob instanceof FormData) {
                updatedJob.append('userID', userID);
                updatedJob.append('updatedBy', userID);
                payload = updatedJob;
                headers = { "Content-Type": "multipart/form-data" };
            } else {
                validateJobOrder(updatedJob);
                payload = {
                    ...updatedJob,
                    userID,
                    updatedBy: userID
                };
                headers = { "Content-Type": "application/json" };
            }

            const res = await axios.patch(`/api/job-orders/${id}`, payload, { headers });

            set((state) => ({
                projects: state.projects.map((project) => 
                    project._id === id ? res.data.data : project
                )
            }));

            return { success: true, message: "Job order updated successfully" };
        } catch (error) {
            console.error("Error updating job order:", error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message 
            };
        }
    },

    // @desc Alert job order notification
    // API ENDPOINT: PATCH /api/job-orders/:id
    alertJobOrder: async (id, alertData) => {
        try {
            const userID = getUserAuth();

            if (!id || !alertData?.jobNotificationAlert) {
                throw new Error("Missing required data for alert update");
            }

            const res = await axios.patch(`/api/job-orders/${id}`, 
                { 
                    ...alertData,
                    userID,
                    updatedBy: userID
                }, 
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            set((state) => ({
                projects: state.projects.map((project) => 
                    project._id === id ? res.data.data : project
                )
            }));

            return { success: true, message: "Job notification alert updated!" };
        } catch (error) {
            console.error("Error updating job notification:", error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message 
            };
        }
    },

    // @desc Archive job order
    // API ENDPOINT: PATCH /api/job-orders/:id
    archiveJobOrder: async (id) => {
        try {
            const userID = getUserAuth();

            const res = await axios.patch(`/api/job-orders/${id}`, 
                { 
                    isArchived: true,
                    archivedAt: new Date(),
                    userID,
                    updatedBy: userID
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            set((state) => ({
                projects: state.projects.map((project) => 
                    project._id === id ? { ...project, isArchived: true, archivedAt: new Date() } : project
                )
            }));

            return { success: true, message: "Job order archived successfully" };
        } catch (error) {
            console.error("Error archiving job order:", error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message 
            };
        }
    },

    // @desc Delete job order
    // API ENDPOINT: DELETE /api/job-orders/:id
    deleteJobOrder: async (id) => {
        try {
            const userID = getUserAuth();

            const res = await axios.delete(`/api/job-orders/${id}`, {
                headers: { "Content-Type": "application/json" },
                data: { userID }
            });

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            set((state) => ({
                projects: state.projects.filter((project) => project._id !== id)
            }));

            return { success: true, message: "Job order deleted successfully" };
        } catch (error) {
            console.error("Error deleting job order:", error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message 
            };
        }
    },

    // @desc Update job order note
    // API ENDPOINT: PATCH /api/job-orders/note/:id
    updateJobOrderNote: async ({ jobOrderId, noteType, noteContent }) => {
        try {
            const userID = getUserAuth();

            if (!["createdNote", "updatedNote"].includes(noteType)) {
                throw new Error("Invalid note type. Must be 'createdNote' or 'updatedNote'.");
            }

            const res = await axios.patch(`/api/job-orders/note/${jobOrderId}`, 
                {
                    noteType,
                    noteContent,
                    userID
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            set((state) => ({
                projects: state.projects.map((project) =>
                    project._id === jobOrderId ? res.data.data : project
                )
            }));

            return { success: true, message: "Note updated successfully" };
        } catch (error) {
            console.error("Error updating job order note:", error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    },

    // Update job order
    updateInquiryStatus: async (id, updatedJob) => {
        try {
            const userID = localStorage.getItem("userID");

            if (!userID) {
                return { success: false, message: "User ID is required" };
            }

            const res = await axios.patch(`/api/job-orders/${id}/inquiry`, {
                ...updatedJob,
                userID
            });

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            set((state) => ({
                projects: state.projects.map((project) =>
                    project._id === id ? res.data.data : project
                ),
            }));

            return { success: true, message: "Inquiry status updated successfully" };
        } catch (error) {
            console.error("Error updating inquiry status:", error);
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
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
}));

