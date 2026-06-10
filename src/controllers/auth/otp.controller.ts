import type { Request, Response } from "express";
import crypto from "crypto";
import User from "../../models/User.ts";
import { sendOtpEmail, sendSignupEmail } from "../../email/emailService.ts";
import { pendingRegistrations } from "./signup.controller.ts";
import { pendingResets } from "./password.controller.ts";

const OTP_EXPIRE_TIME = 15; // 15 minutes in milliseconds

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // ── Case 1: Pending registration (new user signup) ──────────────────────
    const pending = pendingRegistrations.get(normalizedEmail);

    if (pending) {
      const isValid =
        otpHash === pending.otpHash && pending.otpExpires > Date.now();

      if (!isValid) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
      }

      // Create user
      const user = new User({
        first_name: pending.first_name,
        last_name: pending.last_name,
        phone: pending.phone,
        email: pending.email,
        password: pending.password,
        isVerified: true,
      });
      await user.save();

      pendingRegistrations.delete(normalizedEmail);
      await sendSignupEmail(user.email, user.first_name);

      res
        .status(201)
        .json({ message: "Account created successfully. You can now log in." });
      return;
    }

    const pendingReset = pendingResets.get(normalizedEmail);

    if (pendingReset) {
      const isValid =
        otpHash === pendingReset.otpHash &&
        pendingReset.otpExpires > Date.now();

      if (!isValid) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
      }

      // Mark as verified
      pendingReset.isVerified = true;

      // Extend expiry time (give more time to complete reset)
      pendingReset.otpExpires = Date.now() + OTP_EXPIRE_TIME * 60 * 1000; // 15 more minutes

      pendingResets.set(normalizedEmail, pendingReset);

      res.status(200).json({
        message: "OTP verified successfully. You can now reset your password.",
        verified: true,
      });
      return;
    }

    // ── Case 3: Existing user OTP (re-verification) ─────────────────────────
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otp || !user.otpExpires) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    const isValid = otpHash === user.otp && user.otpExpires > Date.now();

    if (!isValid) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Mark verified, clear OTP
    user.isVerified = true;
    user.otp = undefined; // ✅ Fixed: was `user.otp = ;`
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("[verifyOtp]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Send OTP ───────────────────────────────────────────────────────────────
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(200).json({ message: "OTP sent successfully" });
      return;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.otp = otpHash;
    user.otpExpires = Date.now() + OTP_EXPIRE_TIME * 60 * 1000; // ✅ Changed to 15 minutes
    await user.save();

    await sendOtpEmail(user.email, user.first_name, otp, OTP_EXPIRE_TIME); // ✅ Changed to 15

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("[sendOtp]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const otpResend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(200).json({ message: "OTP sent successfully" });
      return;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.otp = otpHash;
    user.otpExpires = Date.now() + OTP_EXPIRE_TIME * 60 * 1000; // ✅ Changed to 15 minutes
    await user.save();

    await sendOtpEmail(user.email, user.first_name, otp, OTP_EXPIRE_TIME); // ✅ Changed to 15

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("[otpResend]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
