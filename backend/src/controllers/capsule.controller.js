import Capsule from "../models/Capsule.js"; 
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// ✅ 1. CREATE CAPSULE (Seal a memory)
export const createCapsule = async (req, res) => {
    try {
        console.log("📝 Body Data:", req.body);

        // Handle File Upload
        let uploadedFile = req.file;
        if (!uploadedFile && req.files && req.files.length > 0) {
            uploadedFile = req.files[0];
        }

        let imageUrl = "";

        if (uploadedFile) {
            console.log("☁️ Uploading to Cloudinary...");
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "orbitx_capsules", resource_type: "auto" },
                    (err, res) => err ? reject(err) : resolve(res)
                );
                stream.end(uploadedFile.buffer);
            });
            imageUrl = result.secure_url;
            console.log("✅ Upload Successful:", imageUrl);
        }

        if (!req.body.title || !req.body.unlockDate) {
            return res.status(400).json({ error: "Title and Date are required" });
        }

        const newCapsule = new Capsule({
            user: req.user.id,
            title: req.body.title,
            message: req.body.message || "",
            unlockAt: req.body.unlockDate, // Matches Schema 'unlockAt'
            image: imageUrl
        });

        await newCapsule.save();
        res.status(201).json({ message: "Capsule Sealed Successfully!" });

    } catch (error) {
        console.error("❌ CREATE ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ 2. GET CAPSULES (Dashboard)
export const getCapsules = async (req, res) => {
    try {
        // Find capsules belonging to this user, sorted by newest first
        const capsules = await Capsule.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Calculate "isUnlocked" status for each capsule
        const now = new Date();
        const capsulesWithStatus = capsules.map(cap => {
            const unlockDate = new Date(cap.unlockAt);
            return {
                ...cap.toObject(),
                isUnlocked: now >= unlockDate // True if today is past the unlock date
            };
        });

        res.status(200).json(capsulesWithStatus);

    } catch (error) {
        console.error("❌ GET ERROR:", error);
        res.status(500).json({ error: "Failed to load capsules" });
    }
};