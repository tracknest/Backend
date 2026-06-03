import crypto from "crypto";
import User from "../../models/User.js";
import { sendOtpEmail } from "../../email/emailService.js";
export const pendingRegistrations = new Map();
// ─── Signup ───────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
    try {
        const { first_name, last_name, phone, email, password } = req.body;
        // Reject if required fields are missing
        if (!first_name || !last_name || !email || !password || !phone) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Prevent duplicate accounts (already verified users)
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(409).json({ message: "Email is already registered" });
            return;
        }
        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        // Store registration data in memory (NOT in the database yet)
        pendingRegistrations.set(normalizedEmail, {
            first_name,
            last_name,
            phone,
            email: normalizedEmail,
            password, // will be hashed by mongoose pre-save hook when user is finally created
            otpHash,
            otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
        });
        // Send OTP email
        await sendOtpEmail(normalizedEmail, first_name, otp, 10);
        res.status(200).json({
            message: "OTP sent to your email. Please verify to complete registration.",
        });
    }
    catch (err) {
        console.error("[signup]", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=signup.controller.js.map