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
  getAllAdmins,
  updateAdmin,
  deactivateAdmin,
  activateAdmin,
  deleteAdmin
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
router.patch('/:id', updateAdmin)
router.patch('/deactivate/:id', deactivateAdmin)
router.patch('/activate/:id', activateAdmin)
router.delete('/delete/:id', deleteAdmin)

export default router;