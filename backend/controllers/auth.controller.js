import Admin from '../models/admin.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateOTP, sendEmail } from '../utils/helpers.js';

// @desc    Signup a new user
// @route   POST /api/auth/signup
export const signup = async (req, res) => { 
    try {
      const { email, password } = req.body;
  
      const existingUser = await Admin.findOne({ email });
  
      if (existingUser) {
        if (existingUser.isEmailVerified) {
          return res.status(400).json({ message: 'Email already exists and is verified. Cannot sign up again.' });
        }
        console.log('User exists but not verified. Proceeding to resend OTP.');
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes otp expiry
  
      const newUser = existingUser || new Admin({
        email,
        password: hashedPassword,
        otp: { code: otp, expiry: otpExpiry },
        isEmailVerified: false
      });
  
      if (!existingUser) {
        await newUser.save();
      } else {
        newUser.otp = { code: otp, expiry: otpExpiry };
        await newUser.save();
      }
  
      // Send OTP Email
      const emailContent = `Your OTP for verification is: ${otp}`;
      await sendEmail(email, 'Verify your email', emailContent);
  
      res.status(201).json({ message: 'User created or OTP resent, OTP sent!' });
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      const user = await Admin.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email' });
      }
  
      if (user.otp.expiry < new Date()) {
        return res.status(400).json({ message: 'OTP expired' });
      }
  
      if (user.otp.code !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      user.isEmailVerified = true;
      user.otp = { code: null, expiry: null };
      await user.save();
  
      res.json({ message: 'OTP verified successfully' });
    } catch (error) {
      console.error('Error during OTP verification:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// @desc    Resend OTP code
// @route   POST /api/auth/resend-otp
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const newOTP = generateOTP();
    const newExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes timer before resend OTP

    user.otp = { code: newOTP, expiry: newExpiry };
    await user.save();

    const emailContent = `Your new OTP is: ${newOTP}`;
    await sendEmail(email, 'New OTP Request', emailContent);

    res.json({ message: 'New OTP sent!' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete user registration (save additional info)
// @route   POST /api/auth/complete-registration
export const completeRegistration = async (req, res) => {
  try {
    const { email, firstName, lastName, phone } = req.body;

    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    await user.save();

    res.json({ message: 'Registration complete!' });
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login an existing user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password incorrect. Please try again!' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ message: 'Email not verified. Contact other admins for verification' });
    }

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '8h' }); // Token expires in 8 hours

    user.loginDate = new Date();
    await user.save(); 

    res.json({ message: 'Logged in successfully', user, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// @desc    Initiate forgot password (send reset link)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found. Please try again.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    user.resetPasswordToken = { token: resetToken, expiry: tokenExpiry };
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailContent = `Click this link to reset your password: ${resetLink}\n\nThis link will expire in 30 minutes. If you did not request this, please ignore this email.`; 
    await sendEmail(email, 'Password Reset Request', emailContent);

    res.json({ message: 'Password reset email sent! Check your email' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset the user's password 
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await Admin.findOne({
      'resetPasswordToken.token': token,
      'resetPasswordToken.expiry': { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }else if(newPassword.length < 8){
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }else if(newPassword.length > 32){
        return res.status(400).json({ message: 'Password must be at most 32 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    user.resetPasswordToken = undefined; 
    await user.save();

    res.json({ message: 'Password reset successful!' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout a user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await Admin.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.logoutDate = new Date();
    await user.save();

    res.json({ message: 'Logged out successfully', logout: true });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get data of logged-in user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ message: 'Authorization required. No token provided.' });
      }

      const token = authHeader.split(" ")[1];

      const decoded = await new Promise((resolve, reject) => 
          jwt.verify(token, process.env.JWT_SECRET, (err, data) => (err ? reject(err) : resolve(data)))
      );

      if (!decoded?.userId) {
          return res.status(401).json({ message: 'Token verification failed.' });
      }

      const user = await Admin.findById(decoded.userId).select('-password -otp -resetPasswordToken');
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ success: true, data: user });
  } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: 'Internal server error.' });
  }
};


// @desc    Fetch all admins
// @route   GET /api/auth/admin
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password -otp -resetPasswordToken');
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        console.error("Error fetching admins:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to fetch admins" });
    }
};
