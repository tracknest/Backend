import { Router } from "express";
import { signup } from "../controllers/auth/signup.controller.ts";
import { login } from "../controllers/auth/login.controller.ts";
import { logout } from "../controllers/auth/logout.controller.ts";
import {
  forgotPassword,
  changePassword,
  resetPassword,
} from "../controllers/auth/password.controller.ts";
import {
  googleAuth,
  googleAuthCallback,
} from "../controllers/auth/google.controller.ts";
import { authenticate } from "../middleware/auth.middleware.ts";
import {
  deleteAccount,
  getProfile,
  updateProfile,
} from "../controllers/auth/profile.controller.ts";
import { sendOtp, verifyOtp, otpResend } from "../controllers/auth/otp.controller.ts";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Profile
 *     description: User profile management
 */

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Stores registration data temporarily and sends an OTP to the provided email. The account is only created after OTP verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, phone, email, password]
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: OTP sent to email. Verify to complete registration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to your email. Please verify to complete registration.
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All fields are required
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is already registered
 *       500:
 *         description: Internal server error
 */
router.post("/register", signup);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64a7f9c2e4b0a12345678901
 *                     first_name:
 *                       type: string
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     phone:
 *                       type: string
 *                       example: "+2348012345678"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     avatarUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://example.com/avatar.jpg
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email and password are required
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out the current user
 *     description: Invalidates the provided JWT by adding it to a blocklist until it naturally expires.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *         description: Missing, invalid, or already-expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Unauthorized
 *                     - Invalid token format
 *                     - Invalid token
 *                     - Token already expired
 *       500:
 *         description: Internal server error
 */
router.post("/logout", logout);

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset OTP
 *     description: |
 *       Sends a 6-digit OTP to the provided email if an account exists.
 *       The OTP expires in 15 minutes. Always returns 200 to prevent
 *       email enumeration. After verifying the OTP via /otp/verify,
 *       call /reset-password to set a new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Generic success response (prevents email enumeration)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If that email is registered, a reset code has been sent.
 *       400:
 *         description: Missing email field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required
 *       500:
 *         description: Internal server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password after OTP verification
 *     description: |
 *       Resets the user's password. Requires that the OTP sent via
 *       /forgot-password has already been verified via /otp/verify.
 *       The reset session expires 15 minutes after the OTP was originally sent.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword, confirmPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewStrongPass123!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewStrongPass123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Validation error, OTP not verified, or expired reset session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Email, OTP, and new password are required
 *                     - New password must be at least 8 characters long
 *                     - New password and confirmation do not match
 *                     - Invalid or expired reset code
 *                     - Please verify your OTP first before resetting password.
 *                     - Reset code has expired
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/reset-password", resetPassword);

/**
 * @openapi
 * /api/v1/auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Initiate Google OAuth login
 *     description: Redirects the user to Google's consent screen to authenticate with their Google account.
 *     responses:
 *       302:
 *         description: Redirects to Google consent screen
 */
router.get("/google", googleAuth);

/**
 * @openapi
 * /api/v1/auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     description: |
 *       Handles the redirect from Google after authentication.
 *       - Success: redirects to `{CLIENT_URL}/auth/callback?token=<jwt>`
 *       - Failure: redirects to `{CLIENT_URL}/login?error=google_auth_failed`
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code returned by Google
 *     responses:
 *       302:
 *         description: Redirects to client on both success and failure
 *       401:
 *         description: OAuth authentication failed
 */
router.get("/google/callback", googleAuthCallback);

/**
 * @openapi
 * /api/v1/auth/profile/me:
 *   get:
 *     tags: [Profile]
 *     summary: Get the current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64a7f9c2e4b0a12345678901
 *                     first_name:
 *                       type: string
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     phone:
 *                       type: string
 *                       example: "+2348012345678"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     avatarUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://example.com/avatar.jpg
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags: [Profile]
 *     summary: Update the current user's profile
 *     description: Updates one or more allowed profile fields. At least one field must be provided.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Jane
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: "+2348098765432"
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/new-avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile update successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64a7f9c2e4b0a12345678901
 *                     first_name:
 *                       type: string
 *                       example: Jane
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     phone:
 *                       type: string
 *                       example: "+2348098765432"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     avatarUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://example.com/new-avatar.jpg
 *       400:
 *         description: No valid fields provided to update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No valid field provider to update
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags: [Profile]
 *     summary: Delete the current user's account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account deleted successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/profile/me", authenticate, getProfile);
router.patch("/profile/me", authenticate, updateProfile);
router.delete("/profile/me", authenticate, deleteAccount);

/**
 * @openapi
 * /api/v1/auth/profile/me/password:
 *   patch:
 *     tags: [Profile]
 *     summary: Change the current user's password
 *     description: Changes password for credential-based accounts. Not available for Google OAuth accounts.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPass123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewPass456!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Missing fields, password too short, or Google OAuth account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - current and new password are required
 *                     - User not found
 *                     - This account uses Google login — no password to change
 *       401:
 *         description: Current password is incorrect or missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current password is incorrect
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 */
router.patch("/profile/me/password", authenticate, changePassword);

/**
 * @openapi
 * /api/v1/auth/otp/send:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to user's email
 *     description: Generates a new OTP and emails it to the user. Always returns 200 to prevent email enumeration. OTP expires in 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent (generic response to prevent enumeration)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       400:
 *         description: Missing email field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required
 *       500:
 *         description: Internal server error
 */
router.post("/otp/send", sendOtp);

/**
 * @openapi
 * /api/v1/auth/otp/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP
 *     description: |
 *       Verifies the OTP for one of three flows:
 *       - **New user registration** — creates the account and returns 201
 *       - **Password reset** — marks the reset session as verified and returns 200
 *       - **Existing user re-verification** — marks the user as verified and returns 200
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: OTP verified successfully (password reset or re-verification flow)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully. You can now reset your password.
 *                 verified:
 *                   type: boolean
 *                   example: true
 *       201:
 *         description: Account created successfully (new user registration flow)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account created successfully. You can now log in.
 *       400:
 *         description: Missing fields or invalid/expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Email and OTP are required
 *                     - Invalid or expired OTP
 *       500:
 *         description: Internal server error
 */
router.post("/otp/verify", verifyOtp);

/**
 * @openapi
 * /api/v1/auth/otp/resend:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP to user's email
 *     description: |
 *       Generates a new OTP (invalidating any previous one) and emails it to the user.
 *       Always returns 200 to prevent email enumeration.
 *       OTP expires in 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP resent successfully
 *       400:
 *         description: Missing email field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required
 *       500:
 *         description: Internal server error
 */
router.post("/otp/resend", otpResend);

export default router;