import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

// 📧 NODEMAILER SETUP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// HELPER: Send OTP Email
async function sendOtp(email, otp) {
    await transporter.sendMail({
        from: '"STASIS Vault" <no-reply@stasis.com>',
        to: email,
        subject: 'STASIS Verification Code',
        text: `Your 6-digit access code is: ${otp}\n\nThis code will expire in 10 minutes.`
    });
}

/* =========================================
   1. REGISTRATION (Create & Send OTP)
   ========================================= */
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
            isVerified: false 
        });

        await user.save();
        await sendOtp(email, otp);

        res.json({ msg: "OTP sent to email", email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

/* =========================================
   2. VERIFY EMAIL
   ========================================= */
router.post("/verify-email", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ msg: "User not found" });
        if (user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).json({ msg: "Invalid or expired OTP" });
        }

        // Activate User
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ msg: "Account verified!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

/* =========================================
   3. LOGIN (Checks isVerified)
   ========================================= */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ msg: "User not found" });
        
        // 🔒 SECURITY CHECK: Must be verified
        if (!user.isVerified) return res.status(400).json({ msg: "Please verify your email first" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

/* =========================================
   4. FORGOT PASSWORD (Request OTP)
   ========================================= */
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendOtp(email, otp);
        res.json({ msg: "OTP sent for password reset" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

/* =========================================
   5. RESET PASSWORD (Submit New Pass)
   ========================================= */
router.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).json({ msg: "Invalid or expired OTP" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ msg: "Password reset successful!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

export default router;