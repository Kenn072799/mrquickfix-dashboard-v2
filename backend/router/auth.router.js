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
  deleteAdmin,
  File_Storage,
  changeProfilePicture
} from '../controllers/auth.controller.js'; 
import { authMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
const upload = multer({storage:File_Storage});
const router = express.Router();

router.post("/signup", signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/complete-registration', completeRegistration);
router.post('/login', login);
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password/:token', resetPassword); 
router.post('/logout', logout);
router.get('/me',authMiddleware, getMe);
router.get('/admin',authMiddleware, getAllAdmins)
router.patch('/:id',authMiddleware, updateAdmin)
router.patch('/deactivate/:id', deactivateAdmin)
router.patch('/activate/:id', activateAdmin)
router.delete('/delete/:id', deleteAdmin)
router.patch('/change-profile/:id',upload.single("profile"),changeProfilePicture)

export default router;