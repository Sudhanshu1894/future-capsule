import mongoose from "mongoose";

const capsuleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {   // ✅ Added Title
    type: String,
    required: true, 
  },
  message: {
    type: String,
    default: "",
  },
  image: {   // ✅ Added Image (Matches controller's 'image')
    type: String,
    default: "",
  },
  unlockAt: {
    type: Date,
    required: true,
  },
  isUnlocked: { // Optional: Helper for status
    type: Boolean, 
    default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Capsule = mongoose.model("Capsule", capsuleSchema);
export default Capsule;