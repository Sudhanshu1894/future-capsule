import express from "express";
import Capsule from "../models/Capsule.js";
import upload from "../middlewares/upload.middleware.js";
import auth from "../middlewares/auth.middleware.js";
import { createCapsule, getCapsules } from "../controllers/capsule.controller.js";

const router = express.Router();

// Route to Seal (Create) - Expects single file named "image"
router.post("/create", auth, upload.single("image"), createCapsule);
router.delete("/:id", auth, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ msg: "Not found" });

    // Optional: Check ownership
    // if (capsule.user.toString() !== req.user.id) return res.status(401).json({ msg: "No auth" });

    await capsule.deleteOne();
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});
// Route to View (Read) - Gets all capsules for dashboard
router.get("/dashboard", auth, getCapsules);

export default router;