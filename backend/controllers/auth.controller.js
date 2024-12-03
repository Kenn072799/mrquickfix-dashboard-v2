import Admin from '../models/admin.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { generateOTP, sendEmail, convertToWebP, upload_Single_Image } from '../utils/helpers.js';
export const File_Storage = multer.memoryStorage();

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
      const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { padding: 20px; font-family: Arial, sans-serif; }
        .header { color: #2c3e50; margin-bottom: 20px; }
        .otp-box { 
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            font-size: 24px;
            text-align: center;
            margin: 20px 0;
        }
        .footer { color: #7f8c8d; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">Email Verification</h2>
        <p>Thank you for registering! To complete your signup, please use the following OTP code:</p>
        <div class="otp-box">${otp}</div>
        <p>This code will expire in 15 minutes.</p>
        <div class="footer">
            <p>If you didn't request this verification, please ignore this email.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>`;
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

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { padding: 20px; font-family: Arial, sans-serif; }
        .header { color: #2c3e50; margin-bottom: 20px; }
        .otp-box { 
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            font-size: 24px;
            text-align: center;
            margin: 20px 0;
        }
        .footer { color: #7f8c8d; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">New OTP Code</h2>
        <p>You requested a new OTP code. Here it is:</p>
        <div class="otp-box">${newOTP}</div>
        <p>This code will expire in 2 minutes.</p>
        <div class="footer">
            <p>If you didn't request this code, please ignore this email.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>`;
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

    if (user.adminStatus === 'deactivated') {
      return res.status(400).json({ message: 'Your account is deactivated. Please contact other admin.' });
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

    if (user.adminStatus === 'deactivated') {
      return res.status(400).json({ message: 'Your account email is deactivated. Please contact other admin.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    user.resetPasswordToken = { token: resetToken, expiry: tokenExpiry };
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { padding: 20px; font-family: Arial, sans-serif; }
        .header { color: #2c3e50; margin-bottom: 20px; }
        .button {
            background-color: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
        }
        .footer { color: #7f8c8d; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p>This link will expire in 30 minutes.</p>
        <div class="footer">
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>`; 
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
      return res.status(400).json({ message: 'The password reset link has expired. Please send a new request' });
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

    // @desc    Update a user
    // @route   patch /api/auth/admin/:id
    export const updateAdmin = async (req, res) => {
        try {
            const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedAdmin) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json({ success: true, data: updatedAdmin });
        } catch (error) {
            console.error("Error updating user:", error.message);
            res.status(500).json({ success: false, message: "Server Error: Failed to update user" });
        }
    };

// @desc    Deactivate an admin user (set status to 'deactivated')
// @route   PATCH /api/auth/admin/:id
export const deactivateAdmin = async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, { adminStatus: 'deactivated' }, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: updatedAdmin });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update user" });
    }
};

// @desc    Activate an admin user (set status to 'active')
// @route   PATCH /api/auth/admin/activate/:id
export const activateAdmin = async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, { adminStatus: 'active' }, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: updatedAdmin });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update user" });
    }
};

// @desc  Delete a admin user
// @route   DELETE /api/auth/admin/:id
export const deleteAdmin = async (req, res) => {
    try {
        const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
        if (!deletedAdmin) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: deletedAdmin });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to delete user" });
    }
};

// @desc    Change profile picture
// @route   PATCH /api/auth/admin/:id
export const changeProfilePicture = async (req, res) => {
  const { id } = req.params;
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY_CLOUD,
      api_secret: process.env.API_SECRET_CLOUD
    });

    const existingProfile = await Admin.findOne({ _id: id });
    if (!existingProfile) {
      return res.status(400).json({ message: "This ID is unknown, please try again" });
    }

    if (existingProfile.profilePublickey) {
      try {
        await cloudinary.uploader.destroy(existingProfile.profilePublickey);
      } catch (error) {
        console.log('Error deleting existing profile picture:', error);
      }
    }

    const buffer = req.file.buffer;
    const webpBuffer = await convertToWebP(buffer);
    
    const data = await upload_Single_Image(webpBuffer);

    await Admin.findByIdAndUpdate(id, {
      profilePicture: data.url,
      profilePublickey: data.public_id
    });

    res.status(201).json({ 
      success: true,
      message: 'Profile picture updated successfully!',
      data: {
        profilePicture: data.url,
        profilePublickey: data.public_id
      }
    });
  }
  catch (error) {
    console.error('Error during changing profile:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to update profile picture'
    });
  }
};
