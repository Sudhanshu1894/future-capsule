import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // ✅ OTP & Verification Fields (Now safely inside the schema)
  isVerified: { 
    type: Boolean, 
    default: false 
  }, // Blocks login until true
  otp: { 
    type: String 
  }, // Stores the 6-digit code
  otpExpires: { 
    type: Date 
  } // Expiration timer
});

export default mongoose.model("User", userSchema);