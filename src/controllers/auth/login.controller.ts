import type { Request, Response } from "express";
import User from "../../models/User.ts";
import jwt from "jsonwebtoken";
import type { LoginDTO } from "../../dto/auth.dto.ts";
import { sendLoginEmail } from "../../email/emailService.ts";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDTO = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    const forwardedFor = (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim();
    const ipAddress = forwardedFor || req.socket.remoteAddress || "unknown";

    const { password: _, ...safeUser } = user.toObject();

    sendLoginEmail(normalizedEmail, user.first_name, ipAddress).catch((err) =>
      console.error("[login] Failed to send login email:", err),
    );

    res
      .status(200)
      .json({ user: safeUser, message: "Login successful", token });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
