import { baseTemplate } from "./base.ts";

export const signupTemplate = (firstName: string) =>
  baseTemplate(
    `
    <p class="greeting">Welcome to TrackNest, ${firstName}! 🎉</p>
    <p class="text">Your account has been created successfully. You can now start tracking your finances, setting budgets, and working towards your goals.</p>
    <p class="text">Here's what you can do with TrackNest:</p>
    <div class="card">
      <div class="card-row"><span class="label">💰 Track Transactions</span><span class="badge badge-blue">Active</span></div>
      <div class="card-row"><span class="label">📊 Manage Budgets</span><span class="badge badge-blue">Active</span></div>
      <div class="card-row"><span class="label">🎯 Set Financial Goals</span><span class="badge badge-blue">Active</span></div>
    </div>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard →</a>
    <hr class="divider"/>
    <p class="text" style="font-size:13px;">If you didn't create this account, please <a href="mailto:support@tracknest.com" style="color:#4f8ef7;">contact support</a> immediately.</p>
  `,
    `Welcome to TrackNest! Your account is ready.`
  );

export const loginTemplate = (firstName: string, loginTime: string, ipAddress?: string) =>
  baseTemplate(
    `
    <p class="greeting">New login detected</p>
    <p class="text">Hi ${firstName}, we noticed a new sign-in to your TrackNest account.</p>
    <div class="card">
      <div class="card-row"><span class="label">Time</span><span class="value">${loginTime}</span></div>
      ${ipAddress ? `<div class="card-row"><span class="label">IP Address</span><span class="value">${ipAddress}</span></div>` : ""}
    </div>
    <div class="warning">⚠️ If this wasn't you, reset your password immediately and contact our support team.</div>
    <a href="${process.env.CLIENT_URL}/settings/security" class="btn">Secure My Account</a>
  `,
    `New login to your TrackNest account.`
  );

export const otpTemplate = (firstName: string, otp: string, expiresInMinutes = 10) =>
  baseTemplate(
    `
    <p class="greeting">Your verification code</p>
    <p class="text">Hi ${firstName}, use the code below to verify your identity. Do not share it with anyone.</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p class="otp-note">⏱ Expires in ${expiresInMinutes} minutes</p>
    </div>
    <div class="warning">🔒 TrackNest will never ask for this code via phone or email. Never share it.</div>
  `,
    `Your TrackNest verification code: ${otp}`
  );

export const forgotPasswordTemplate = (firstName: string, resetUrl: string) =>
  baseTemplate(
    `
    <p class="greeting">Reset your password</p>
    <p class="text">Hi ${firstName}, we received a request to reset your TrackNest password. Click the button below to choose a new one.</p>
    <a href="${resetUrl}" class="btn">Reset Password →</a>
    <hr class="divider"/>
    <p class="text" style="font-size:13px;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    <p class="text" style="font-size:12px; color:#a0aec0;">Or copy this link: <br/><span style="color:#4f8ef7;">${resetUrl}</span></p>
  `,
    `Reset your TrackNest password.`
  );

export const resetPasswordSuccessTemplate = (firstName: string) =>
  baseTemplate(
    `
    <p class="greeting">Password changed ✓</p>
    <p class="text">Hi ${firstName}, your TrackNest password was successfully updated.</p>
    <div class="warning">⚠️ If you did not make this change, contact support immediately and reset your password.</div>
    <a href="${process.env.CLIENT_URL}/login" class="btn">Login to Your Account</a>
  `,
    `Your TrackNest password has been changed.`
  );

export const logoutTemplate = (firstName: string, logoutTime: string) =>
  baseTemplate(
    `
    <p class="greeting">You've been logged out</p>
    <p class="text">Hi ${firstName}, you were successfully logged out of your TrackNest account at ${logoutTime}.</p>
    <p class="text">If this wasn't you, your account may be compromised.</p>
    <a href="${process.env.CLIENT_URL}/login" class="btn">Login Again</a>
  `,
    `You've been logged out of TrackNest.`
  );