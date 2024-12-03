import axios from "axios";
import { create } from "zustand";

const PROJECTS_API = {
    FETCH: "/api/projects/",
    CREATE: "/api/projects/save",
    DELETE: (id) => `/api/projects/remove/${id}`
};

/**
 * Project data store using Zustand
 */
export const useProjectData = create((set) => ({
    projects: [],
    isLoading: false,
    error: null,

    /**
     * Set projects array
     * @param {Array} projects - Array of project objects
     */
    setProjects: (projects) => set({ projects }),

    /**
     * Upload new project with images
     * @param {FormData} projectData - Form data containing project details and images
     * @returns {Promise<Object>} Result object with success status and message
     */
    uploadProject: async (projectData) => {
        set({ isLoading: true, error: null });

        try {
            // Validate project data
            if (!projectData || !(projectData instanceof FormData)) {
                throw new Error("Invalid project data format");
            }

            const response = await axios.post(PROJECTS_API.CREATE, projectData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Update store with new project
            set((state) => ({ 
                projects: [...state.projects, response.data.data],
                isLoading: false 
            }));

            return { 
                success: true, 
                message: "Project created successfully",
                data: response.data.data
            };

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to create project";
            set({ error: errorMessage, isLoading: false });
            
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    },

    /**
     * Fetch all projects
     * @returns {Promise<Array>} Array of project objects
     */
    fetchProjects: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.get(PROJECTS_API.FETCH);
            const projects = response.data.data || [];
            
            set({ 
                projects, 
                isLoading: false 
            });

            return projects;

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch projects";
            set({ 
                error: errorMessage, 
                isLoading: false 
            });
            
            throw new Error(errorMessage);
        }
    },

    /**
     * Remove project by ID
     * @param {string} id - Project ID to remove
     * @returns {Promise<void>}
     */
    removeProject: async (id) => {
        set({ isLoading: true, error: null });

        try {
            if (!id) {
                throw new Error("Project ID is required");
            }

            await axios.delete(PROJECTS_API.DELETE(id));

            // Update store by filtering out deleted project
            set((state) => ({
                projects: state.projects.filter(project => project._id !== id),
                isLoading: false
            }));

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete project";
            set({ 
                error: errorMessage, 
                isLoading: false 
            });
            
            throw new Error(errorMessage);
        }
    },

    /**
     * Clear any errors in the store
     */
    clearError: () => set({ error: null })
}));