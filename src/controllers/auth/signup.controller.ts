import type { Request, Response } from "express";
import crypto from "crypto";
import type { SignupDTO } from "../../dto/auth.dto.ts";
import User from "../../models/User.ts";
import { sendOtpEmail } from "../../email/emailService.ts";

type PendingRegistration = SignupDTO & {
  otpHash: string;
  otpExpires: number;
};

export const pendingRegistrations = new Map<string, PendingRegistration>();

// ─── Signup ───────────────────────────────────────────────────────────────────
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, phone, email, password }: SignupDTO = req.body;

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
  } catch (err) {
    console.error("[signup]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};