import axios from "axios";
import { create } from "zustand";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  ME: "/api/auth/me",
  SIGNUP: "/api/auth/signup",
  VERIFY_OTP: "/api/auth/verify-otp",
  RESEND_OTP: "/api/auth/resend-otp",
  COMPLETE_REGISTRATION: "/api/auth/complete-registration",
  ADMIN: "/api/auth/admin",
};

const handleApiError = (error) => {
  const errorMessage = error.response?.data?.message || error.message;
  console.error("API Error:", {
    timestamp: new Date().toISOString(),
    error: errorMessage,
    stack: error.stack
  });
  return errorMessage;
};

const checkAndHandleToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authorization token found");
  }
  return token;
};

const handleAuthenticationError = () => {
  localStorage.removeItem("authToken");
  localStorage.setItem("isLoggedIn", "false");
  window.location.href = "/login-admin";
};

let statusCheckInterval;

export const useAdminData = create((set) => ({
  admin: null,
  admins: [],
  loading: false,
  error: null,
  resendStatus: null,
  timer: 0,

  startStatusCheck: () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    
    statusCheckInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        // Check token expiration
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          await Swal.fire({
            title: "Session Ended",
            text: message,
            icon: "warning",
            confirmButtonText: "OK",
            allowOutsideClick: false
          }).then(() => {
            handleAuthenticationError();
          });
          return;
        }

        // Check admin status
        const res = await axios.get(API_ENDPOINTS.ME, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.data.adminStatus === "deactivated") {
          await Swal.fire("Account Deactivated", "Your account has been deactivated", "warning")
          .then(() => {
            handleAuthenticationError();
          });
          return;
        }

      } catch (error) {
        console.error("Status check failed:", error);
        if (error.response?.status === 401) {
          handleAuthenticationError();
        }
      }
    }, 30000); // Check every 30 seconds
  },

  stopStatusCheck: () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      statusCheckInterval = null;
    }
  },

  // @desc Login admin 
  // API ENDPOINT: POST /api/auth/login
  loginAdmin: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(API_ENDPOINTS.LOGIN, formData);
      const { token, ...userData } = res.data;
      
      localStorage.setItem("authToken", token);
      localStorage.setItem("isLoggedIn", "true");
      
      set({ admin: userData, loading: false });
      useAdminData.getState().startStatusCheck();
      return userData;
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // @desc Logout admin
  // API ENDPOINT: POST /api/auth/logout
  logoutAdmin: async () => {  
    try {
      const token = checkAndHandleToken();
      const response = await axios.post(API_ENDPOINTS.LOGOUT, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.logout) {
        useAdminData.getState().stopStatusCheck();
        localStorage.removeItem("authToken");
        localStorage.removeItem("isLoggedIn");
        set({ admin: null });
        await Swal.fire("Success", "Logout successful!", "success");
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // @desc Get logged in admin
  // API ENDPOINT: GET /api/auth/me
  getLoggedInAdmin: async () => {
    set({ loading: true, error: null });
    try {
      const token = checkAndHandleToken();
      
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }

      const res = await axios.get(API_ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const adminData = res.data.data;
      
      if (adminData.adminStatus === "deactivated") {
        throw new Error("Account deactivated");
      }

      set({ admin: adminData, loading: false });
      return adminData;

    } catch (error) {
      const errorMessage = handleApiError(error);
      
      if (error.message === "Token expired" || error.message === "Account deactivated") {
        handleAuthenticationError();
        await Swal.fire("Error", errorMessage, "error");
      }
      
      set({ admin: null, error: errorMessage, loading: false });
      throw error;
    }
  },

  // @desc Get all admins
  // API ENDPOINT: GET /api/auth/admin
  getAllAdmins: async () => {
    set({ loading: true, error: null });
    try {
      const token = checkAndHandleToken();
      const res = await axios.get(API_ENDPOINTS.ADMIN, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ admins: res.data.data, loading: false });
      return res.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // @desc Update admin
  // API ENDPOINT: PATCH /api/auth/:id
  updateAdmin: async (formData) => {
    set({ loading: true, error: null });
    try {
      const token = checkAndHandleToken();
      const res = await axios.patch(`/api/auth/${formData._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        admins: state.admins.map((admin) => 
          admin._id === formData._id ? res.data : admin
        ),
        loading: false
      }));
      
      return res.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // @desc Deactivate admin
  // API ENDPOINT: PATCH /api/auth/deactivate/:id
  deactivateAdmin: async (adminId) => {
    set({ loading: true, error: null });
    try {
      const token = checkAndHandleToken();
      const res = await axios.patch(`/api/auth/deactivate/${adminId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        admins: state.admins.map((admin) =>
          admin._id === adminId ? { ...admin, adminStatus: "inactive" } : admin
        ),
        loading: false
      }));
      
      return res.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
      await Swal.fire("Error", errorMessage, "error");
      throw error;
    }
  },

  // @desc Activate admin
  // API ENDPOINT: PATCH /api/auth/activate/:id
  activateAdmin: async (adminId) => {
    set({ loading: true, error: null });
    try {
      const token = checkAndHandleToken();
      const res = await axios.patch(`/api/auth/activate/${adminId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        admins: state.admins.map((admin) =>
          admin._id === adminId ? { ...admin, adminStatus: "active" } : admin
        ),
        loading: false
      }));
      
      return res.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
      await Swal.fire("Error", errorMessage, "error");
      throw error;
    }
  },

  // @desc Delete admin
  // API ENDPOINT: DELETE /api/auth/delete/:id
  deleteAdmin: async (adminId) => {
    set({ loading: true, error: null });
    try {
      const token = checkAndHandleToken();
      await axios.delete(`/api/auth/delete/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        admins: state.admins.filter((admin) => admin._id !== adminId),
        loading: false
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
      await Swal.fire("Error", errorMessage, "error");
      throw error;
    }
  },

  // @desc Signup admin
  // API ENDPOINT: POST /api/auth/signup
  signup: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(API_ENDPOINTS.SIGNUP, formData);
      set({ admin: res.data, loading: false });
      return res.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // @desc Verify OTP
  // API ENDPOINT: POST /api/auth/verify-otp
  verifyOTP: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(API_ENDPOINTS.VERIFY_OTP, { email, otp });
      const success = res.data?.message === 'OTP verified successfully';
      
      set({ loading: false, error: success ? null : "Incorrect OTP" });
      return { success };
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ loading: false, error: errorMessage });
      return { success: false };
    }
  },

  // @desc Resend OTP
  // API ENDPOINT: POST /api/auth/resend-otp
  resendOTP: async (email) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(API_ENDPOINTS.RESEND_OTP, { email });
      set({ loading: false, resendStatus: res.data.message });
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
    }
  },

  // @desc Complete details
  // API ENDPOINT: POST /api/auth/complete-registration
  completeDetails: async (formData, email) => {
    set({ loading: true, error: null });
    
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      set({ error: 'Please fill in all required fields', loading: false });
      return;
    }
    
    try {
      const res = await axios.post(API_ENDPOINTS.COMPLETE_REGISTRATION, {
        ...formData,
        email
      });
      set({ loading: false, error: null });
      return res.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, loading: false });
    }
  },

    // @desc Forgot password function
    // API ENDPOINT: POST /api/auth/forgot-password
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
  
    // @desc Reset password
    // API ENDPOINT: POST /api/auth/reset-password
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

    // @desc Change profile
    // API ENDPOINT: PATCH /api/auth/change-profile
    uploadProfile: async(adminID, profilePicture)=>{
      set({ loading: true, error: null });
      const formPicture = new FormData();
      formPicture.append("profile",profilePicture);
      console.log(profilePicture)
      try{
      const res = await axios.patch(`/api/auth/change-profile/${adminID}`, formPicture);
      set((state) => ({
        admins: state.admins.map((admin) => (admin._id === formData._id ? res.data : admin)),
      }));
      return res.data;
      }
      catch(error){
        set({
          error: error.response?.data?.message || error.message,
          loading: false,
        });
        Swal.fire("Error", error.response?.data?.message || "Failed to change profile.", "error");
        throw error;
      }
    },
}));
