import express from 'express';
import { 
  signup, 
  verifyOTP, 
  resendOTP, 
  completeRegistration, 
  login, 
  forgotPassword, 
  resetPassword,
  logout,
  getMe,
  getAllAdmins
} from '../controllers/auth.controller.js'; 

const router = express.Router();

router.post("/signup", signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/complete-registration', completeRegistration);
router.post('/login', login);
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password/:token', resetPassword); 
router.post('/logout', logout);
router.get('/me' , getMe);
router.get('/admin', getAllAdmins)

export default router;