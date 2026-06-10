import { Resend } from "resend";
import {
  signupTemplate,
  loginTemplate,
  otpTemplate,
  forgotPasswordTemplate,
  resetPasswordSuccessTemplate,
  logoutTemplate,
} from "./templates/auth.templates.ts";
import {
  depositTemplate,
  withdrawalTemplate,
  budgetAddedTemplate,
  budgetRemovedTemplate,
  budgetDepositTemplate,
  budgetWithdrawTemplate,
  goalAddedTemplate,
  goalRemovedTemplate,
  goalDepositTemplate,
  goalWithdrawTemplate,
} from "./templates/finance.templates.ts";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "TrackNest <noreply@believetechhub.com>";

// ─── Core send helper ─────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
  if (error) {
    console.error("[emailService] Failed to send email:", error);
    throw new Error(error.message);
  }
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const sendSignupEmail = (to: string, firstName: string) =>
  send(to, "Welcome to TrackNest 🎉", signupTemplate(firstName));

export const sendLoginEmail = (
  to: string,
  firstName: string,
  ipAddress?: string,
) => {
  const loginTime = new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return send(
    to,
    "New login to your TrackNest account",
    loginTemplate(firstName, loginTime, ipAddress),
  );
};

export const sendOtpEmail = async (
  to: string,
  firstName: string,
  otp: string,
  expiresInMinutes: number = 10,
): Promise<void> => {
  try {
    // 3. Generate HTML using the template
    const htmlContent = otpTemplate(firstName, otp, expiresInMinutes);

    // 4. Send email
    await send(to, `${otp} is your TrackNest verification code`, htmlContent);
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    throw err;
  }
};

export const sendForgotPasswordEmail = (
  to: string,
  firstName: string,
  resetToken: string,
) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  return send(
    to,
    "Reset your TrackNest password",
    forgotPasswordTemplate(firstName, resetUrl),
  );
};

export const sendResetPasswordSuccessEmail = (to: string, firstName: string) =>
  send(
    to,
    "Your password has been changed",
    resetPasswordSuccessTemplate(firstName),
  );

export const sendLogoutEmail = (to: string, firstName: string) => {
  const logoutTime = new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return send(
    to,
    "You've been logged out of TrackNest",
    logoutTemplate(firstName, logoutTime),
  );
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const sendDepositEmail = (
  to: string,
  firstName: string,
  amount: number,
  newBalance: number,
  ref?: string,
) =>
  send(
    to,
    "Deposit successful 💰",
    depositTemplate(firstName, amount, newBalance, ref),
  );

export const sendWithdrawalEmail = (
  to: string,
  firstName: string,
  amount: number,
  newBalance: number,
  ref?: string,
) =>
  send(
    to,
    "Withdrawal processed",
    withdrawalTemplate(firstName, amount, newBalance, ref),
  );

// ─── Budget ───────────────────────────────────────────────────────────────────

export const sendBudgetAddedEmail = (
  to: string,
  firstName: string,
  budgetName: string,
  limit: number,
) =>
  send(
    to,
    `Budget "${budgetName}" created`,
    budgetAddedTemplate(firstName, budgetName, limit),
  );

export const sendBudgetRemovedEmail = (
  to: string,
  firstName: string,
  budgetName: string,
) =>
  send(
    to,
    `Budget "${budgetName}" removed`,
    budgetRemovedTemplate(firstName, budgetName),
  );

export const sendBudgetDepositEmail = (
  to: string,
  firstName: string,
  budgetName: string,
  amount: number,
  budgetBalance: number,
) =>
  send(
    to,
    `Funds added to "${budgetName}" budget`,
    budgetDepositTemplate(firstName, budgetName, amount, budgetBalance),
  );

export const sendBudgetWithdrawEmail = (
  to: string,
  firstName: string,
  budgetName: string,
  amount: number,
  mainBalance: number,
) =>
  send(
    to,
    `Funds moved from "${budgetName}" to main account`,
    budgetWithdrawTemplate(firstName, budgetName, amount, mainBalance),
  );

// ─── Goal ─────────────────────────────────────────────────────────────────────

export const sendGoalAddedEmail = (
  to: string,
  firstName: string,
  goalName: string,
  targetAmount: number,
  deadline?: string,
) =>
  send(
    to,
    `Goal "${goalName}" created 🎯`,
    goalAddedTemplate(firstName, goalName, targetAmount, deadline),
  );

export const sendGoalRemovedEmail = (
  to: string,
  firstName: string,
  goalName: string,
) =>
  send(
    to,
    `Goal "${goalName}" removed`,
    goalRemovedTemplate(firstName, goalName),
  );

export const sendGoalDepositEmail = (
  to: string,
  firstName: string,
  goalName: string,
  amount: number,
  savedSoFar: number,
  targetAmount: number,
) =>
  send(
    to,
    `Progress update on "${goalName}" 🎯`,
    goalDepositTemplate(firstName, goalName, amount, savedSoFar, targetAmount),
  );

export const sendGoalWithdrawEmail = (
  to: string,
  firstName: string,
  goalName: string,
  amount: number,
  mainBalance: number,
) =>
  send(
    to,
    `Funds moved from goal "${goalName}"`,
    goalWithdrawTemplate(firstName, goalName, amount, mainBalance),
  );
