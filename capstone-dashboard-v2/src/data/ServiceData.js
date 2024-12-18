import axios from "axios";
import { create } from "zustand";

export const useServicesData = create((set) => ({
  projects: [],
  error: null,

  // @ desc Create a new service
  // @ route POST /api/services
  AddProject: async (newService) => {
    const requiredFields = ["serviceDescription"];
    for (const field of requiredFields) {
      const value = newService.get(field);
      if (!value) {
        return {
          success: false,
          message: `${field} is required`,
        };
      }
    }

    try {
      const res = await axios.post("/api/services/save", newService, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      set((state) => ({ 
        projects: [...state.projects, res.data.data],
        error: null 
      }));

      return { 
        success: true, 
        message: "Service created successfully" 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create service";
      set({ error: errorMessage });
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  },

  // @ desc Fetch all services
  // @ route GET /api/services
  fetchServiceData: async () => {
    try {
      const res = await axios.get("/api/services/");
      const fetchedProjects = res.data.data || [];
      
      set({ 
        projects: fetchedProjects,
        error: null 
      });
      
      return fetchedProjects;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch services";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // @desc Delete a service
  // @route DELETE /api/services/removeservice/:id
  removeServiceData: async (id) => {
    try {
      await axios.delete(`/api/services/removeservice/${id}`);
      
      set((state) => ({
        projects: state.projects.filter((project) => project._id !== id),
        error: null
      }));

      return {
        success: true,
        message: "Service deleted successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete service";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // @desc Update a service
  // @route PATCH /api/services/update-text/:id
  updateTextService: async (serviceId, updatedData) => {
    try {
      const res = await axios.patch(
        `/api/services/update-text/${serviceId}`, 
        updatedData
      );

      set((state) => ({
        projects: state.projects.map((service) =>
          service._id === serviceId ? res.data.data : service
        ),
        error: null
      }));

      return { 
        success: true, 
        message: "Service updated successfully" 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update service";
      set({ error: errorMessage });
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  },

  // @desc Update a service image
  // @route PATCH /api/services/update-image/:id
  updateImageService: async (serviceId, imageFile) => {
    try {
      const res = await axios.patch(
        `/api/services/update-image/${serviceId}`, 
        imageFile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      set((state) => ({
        projects: state.projects.map((service) =>
          service._id === serviceId ? res.data.data : service
        ),
        error: null
      }));

      return { 
        success: true, 
        message: "Service image updated successfully" 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update service image";
      set({ error: errorMessage });
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  },
}));