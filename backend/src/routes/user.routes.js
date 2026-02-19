import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = express.Router();

/* =========================
   MULTER MEMORY STORAGE
========================= */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =========================
   GET LOGGED-IN USER
========================= */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    // ⚠️ CRITICAL OPTIMIZATION: 
    // Do NOT send the raw image buffer (binary data) in the JSON. 
    // It makes the response huge and slow.
    const user = await User.findById(userId).select("-password -profileImage.data");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   UPLOAD PROFILE IMAGE
========================= */
router.post(
  "/upload-profile",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Update the user with the new buffer and content type
      await User.findByIdAndUpdate(userId, {
        profileImage: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
      });

      res.json({ message: "Image stored in MongoDB" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

/* =========================
   SERVE PROFILE IMAGE (PUBLIC)
========================= */
// 1. Changed route to include :id parameter
// 2. REMOVED authMiddleware so <img> tags can load it
router.get("/profile-image/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.profileImage || !user.profileImage.data) {
        // Return a 404 so the frontend can show a default image
        return res.status(404).send("No image found");
    }

    res.set("Content-Type", user.profileImage.contentType);
    res.send(user.profileImage.data);

  } catch (err) {
    res.status(500).send("Error fetching image");
  }
});
/* =========================
   DELETE PROFILE IMAGE
========================= */
router.delete("/delete-profile-image", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Find user and explicitly set profileImage to null/undefined
    await User.findByIdAndUpdate(userId, { 
      $unset: { profileImage: "" } // Mongo command to remove the field entirely
    });

    res.json({ message: "Profile photo deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;