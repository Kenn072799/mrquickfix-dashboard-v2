import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true, 
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String, 
  },
  lastName: {
    type: String, 
  },
  phone: {
    type: String, 
  },
  adminStatus: {
    type: String,
    enum: ['active', 'deactivated'],
    default: 'active',
  },
  profilePicture: {
    type: String, 
  },
  profilePublickey:{
    type:String
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  role: { 
    type: String,
    enum: ['admin'],
    default: 'admin',
  },
  otp: {
    code: { type: String },
    expiry: { type: Date },
  },
  resetPasswordToken: {
    token: { type: String },
    expiry: { type: Date },
  },
  loginDate: {
    type: Date,
  },
  logoutDate: {
    type: Date,
  },
}, { timestamps: true });

adminSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.loginDate = new Date(); 
  } else {
    if (this.loginDate && !this.logoutDate) { 
      // Set the logoutDate ONLY if loginDate exists
      this.logoutDate = new Date();
    }
  }
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
