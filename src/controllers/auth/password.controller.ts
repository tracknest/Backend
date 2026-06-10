import type { Request, Response } from "express";
import crypto from "crypto";
import User from "../../models/User.ts";
import { sendOtpEmail } from "../../email/emailService.ts";

type PendingReset = {
  otpHash: string;
  otpExpires: number;
  isVerified?: boolean;
};

export const pendingResets = new Map<string, PendingReset>();

const RESET_TOKEN_EXPIRY_MINUTES = 15;

const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(200).json({
        message: "If that email is registered, a reset code has been sent.",
      });
      return;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    pendingResets.set(normalizedEmail, {
      otpHash,
      otpExpires: Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
      isVerified: false,
    });

    await sendOtpEmail(
      normalizedEmail,
      user.first_name,
      otp,
      RESET_TOKEN_EXPIRY_MINUTES,
    );

    res.status(200).json({
      message: "If that email is registered, a reset code has been sent.",
    });
  } catch (err) {
    console.error("[forgotPassword]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as any)?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({ message: "current and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.password) {
      res.status(400).json({
        message: "This account uses Google login — no password to change",
      });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    // Assign the new password — the pre-save hook hashes it automatically
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("[changePassword]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res
        .status(400)
        .json({ message: "New password must be at least 8 characters long" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res
        .status(400)
        .json({ message: "New password and confirmation do not match" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pending = pendingResets.get(normalizedEmail);

    if (!pending) {
      res.status(400).json({ message: "Invalid or expired reset code" });
      return;
    }

    if (!pending.isVerified) {
      res.status(400).json({
        message: "Please verify your OTP first before resetting password.",
      });
      return;
    }

    if (pending.otpExpires < Date.now()) {
      pendingResets.delete(normalizedEmail);
      res.status(400).json({ message: "Reset code has expired" });
      return;
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.password = newPassword;
    await user.save();

    pendingResets.delete(normalizedEmail);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("[resetPassword]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
