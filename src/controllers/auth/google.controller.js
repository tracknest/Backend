import passport from "passport";
import jwt from "jsonwebtoken";
export const googleAuth = passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
});
export const googleAuthCallback = (req, res) => {
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed` }, (err, user) => {
        if (err || !user) {
            console.error("Google authentication error:", err);
            res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
            return;
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    })(req, res);
};
//# sourceMappingURL=google.controller.js.map