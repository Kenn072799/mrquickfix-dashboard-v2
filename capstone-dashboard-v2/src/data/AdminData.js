import axios from "axios";
import { create } from "zustand";
import Swal from "sweetalert2";

export const useAdminData = create((set) => ({
  admin: null,
  admins: [],
  loading: false,
  error: null,
  resendStatus: null,
  timer: 0,

  // Login function
  loginAdmin: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/api/auth/login", formData);
      localStorage.setItem("authToken", res.data.token);
      set({ admin: res.data, loading: false });
      localStorage.setItem("isLoggedIn", "true");
      return res.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      throw error;
    }
  },

  // Logout function
  logoutAdmin: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error('No token found for logout.');
      return;
    }
  
    try {
      const response = await axios.post("/api/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.logout) {
        set({ admin: null });
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("authToken");
        Swal.fire("Success", "Logout successful!", "success");
      }
    } catch (error) {
      console.error('Logout failed:', error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  // Forgot password function
  forgotPass: async (email) => {
    set({ loading: true, error: null, message: null });
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      set({
        loading: false,
        message: response.data.message,
        error: null
      });
    } catch (error) {
      set({
        loading: false,
        message: '',
        error: error.response?.data?.message || 'An error occurred. Please try again later.'
      });
    }
  },

  // Reset password function
  resetPassword: async (token, newPassword) => {
    set({ loading: true, error: null, message: null });
  
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, { newPassword });
      set({
        loading: false,
        message: res.data.message,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        message: '',
        error: error.response?.data?.message || 'An error occurred. Please try again later.',
      });
    }
  },

  // Get logged-in admin details
  getLoggedInAdmin: async () => {
    set({ loading: true, error: null });
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            alert("You are not logged in. Please log in again.");
            window.location.href = "/login-admin";
            return;
        }

        const res = await axios.get("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        set({ admin: res.data.data, loading: false });
        return res.data.data;
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            alert("Session has expired or is invalid. Please log in again.");
            localStorage.removeItem("authToken");
            localStorage.setItem("isLoggedIn", "false");
            window.location.href = "/login-admin";
        } else {
            set({
                admin: null,
                error: error.response?.data?.message || error.message,
                loading: false
            });
        }
        throw error;
    }
  },


  // Signup function
  signup: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/api/auth/signup", formData);
      set({ admin: res.data, loading: false });
      Swal.fire("Success", "Signup successful!", "success");
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  // Verify OTP function
  verifyOTP: async (email, otp) => {
    set({ loading: true, error: null });
  
    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      if (res.data && res.data.message === 'OTP verified successfully') { 
        set({ loading: false, error: null });
        return { success: true }; 
      } else {
        set({ loading: false, error: "Incorrect OTP. Please try again." });
        return { success: false }; 
      }
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "An error occurred. Please try again.",
      });
      return { success: false };
    }
  },

  // Resend OTP function
  resendOTP: async (email) => {
    set({ loading: true, error: null });
  
    try {
      const res = await axios.post("/api/auth/resend-otp", { email });
      set({ loading: false, resendStatus: res.data.message });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
    }
  },

  // Complete registration details
  completeDetails: async (formData, email) => {
    set({ loading: true, error: null });
  
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      set({ error: 'Please fill in all required fields', loading: false });
      return;
    }
  
    try {
      const res = await axios.post("/api/auth/complete-registration", {
        ...formData,
        email: email,
      });
      set({ loading: false, error: null });
      return res.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
    }
  },

  // Get all admins
  getAllAdmins: async () => {
    set({ loading: true, error: null });
  
    try {
      const res = await axios.get("/api/auth/admin");
      set({ admins: res.data.data, loading: false });
      return res.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
    }
  },

// Update admin details
updateAdmin: async (formData) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.patch(`/api/auth/${formData._id}`, formData);
    set((state) => ({
      admins: state.admins.map((admin) => (admin._id === formData._id ? res.data : admin)),
    }));
    return res.data;
  } catch (error) {
    set({
      error: error.response?.data?.message || error.message,
      loading: false,
    });
  }
},

  // Deactivate admin
  deactivateAdmin: async (adminId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`/api/auth/deactivate/${adminId}`);
      set((state) => ({
        admins: state.admins.map((admin) =>
          admin._id === adminId ? { ...admin, adminStatus: "inactive" } : admin
        ),
        loading: false,
      }));
      return res.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      Swal.fire("Error", error.response?.data?.message || "Failed to deactivate admin.", "error");
      throw error;
    }
  },

  // Activate admin
  activateAdmin: async (adminId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`/api/auth/activate/${adminId}`);
      set((state) => ({
        admins: state.admins.map((admin) =>
          admin._id === adminId ? { ...admin, adminStatus: "active" } : admin
        ),
        loading: false,
      }));
      return res.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      Swal.fire("Error", error.response?.data?.message || "Failed to activate admin.", "error");
      throw error;
    }
  },

  // Delete admin
  deleteAdmin: async (adminId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/auth/delete/${adminId}`);
      set((state) => ({
        admins: state.admins.filter((admin) => admin._id !== adminId),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      Swal.fire("Error", error.response?.data?.message || "Failed to delete admin.", "error");
      throw error;
    }
  },

}));
