import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { data: Buffer, contentType: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);