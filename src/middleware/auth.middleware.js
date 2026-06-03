import passport from "passport";
import { isTokenBlocked } from "../utils/tokenBlocklist.js";
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // Check if Authorization header exists and is Bearer type
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized — no token provided" });
            return;
        }
        const token = authHeader.split(" ")[1];
        // Extra safety: ensure token actually exists after split
        if (!token) {
            res.status(401).json({ message: "Unauthorized — malformed token" });
            return;
        }
        // Check if token is revoked/blocked
        const blocked = await isTokenBlocked(token);
        if (blocked) {
            res.status(401).json({ message: "Unauthorized — token has been revoked" });
            return;
        }
        // Delegate JWT verification (signature + expiry) to Passport
        passport.authenticate("jwt", { session: false }, (err, user) => {
            if (err) {
                console.error("[authenticate]", err);
                res.status(500).json({ message: "Internal server error" });
                return;
            }
            if (!user) {
                res.status(401).json({ message: "Unauthorized — invalid or expired token" });
                return;
            }
            req.user = user;
            next();
        })(req, res, next);
    }
    catch (err) {
        console.error("[authenticate]", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // No token → proceed as guest
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            next();
            return;
        }
        const token = authHeader.split(" ")[1];
        // Malformed token → treat as guest
        if (!token) {
            next();
            return;
        }
        // If token is blocked, treat as guest (don't reject)
        const blocked = await isTokenBlocked(token);
        if (blocked) {
            next();
            return;
        }
        // Verify token with Passport
        passport.authenticate("jwt", { session: false }, (err, user) => {
            if (!err && user) {
                req.user = user;
            }
            // Always continue (even if token is invalid)
            next();
        })(req, res, next);
    }
    catch (err) {
        console.error("[optionalAuthenticate]", err);
        next();
    }
};
//# sourceMappingURL=auth.middleware.js.map