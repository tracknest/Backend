import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { isTokenBlocked } from "../utils/tokenBlocklist.ts";
import type { IUser } from "../models/User.ts";
import logger from "../config/logger.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const extractBearerToken = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.split(" ")[1] ?? null;
};

// ─── Authenticate ─────────────────────────────────────────────────────────────
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      res.status(401).json({ message: "Unauthorized — no token provided" });
      return;
    }

    const blocked = await isTokenBlocked(token);
    if (blocked) {
      res
        .status(401)
        .json({ message: "Unauthorized — token has been revoked" });
      return;
    }

    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error | null, user: IUser | false) => {
        if (err) {
          logger.error("[authenticate] " + err);
          res.status(500).json({ message: "Internal server error" });
          return;
        }

        if (!user) {
          res
            .status(401)
            .json({ message: "Unauthorized — invalid or expired token" });
          return;
        }

        req.user = user;
        next();
      },
    )(req, res);
  } catch (err) {
    logger.error("[authenticate] " + err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Optional Authenticate ────────────────────────────────────────────────────
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(req);

    // No token → proceed as guest
    if (!token) {
      next();
      return;
    }

    // Blocked token → treat as guest
    const blocked = await isTokenBlocked(token);
    if (blocked) {
      next();
      return;
    }

    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error | null, user: IUser | false) => {
        if (!err && user) {
          req.user = user;
        }
        // Always continue regardless of token validity
        next();
      },
    )(req, res);
  } catch (err) {
    logger.error("[optionalAuthenticate] " + err);
    next();
  }
};
