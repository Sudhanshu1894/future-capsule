import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage, // ✅ THIS LINE WAS MISSING
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

export default upload;
