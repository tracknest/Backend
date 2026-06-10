import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { blockToken } from "../../utils/tokenBlocklist.ts";

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(400).json({ message: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // ✅ Fix: Explicit check to satisfy TypeScript
    if (!token) {
      res.status(400).json({ message: "Invalid token format" });
      return;
    }

    const decoded = jwt.decode(token) as { exp: number } | null;

    if (!decoded || !decoded.exp) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    if (expiresIn <= 0) {
      res.status(400).json({ message: "Token already expired" });
      return;
    }

    await blockToken(token, expiresIn);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("[logout]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
