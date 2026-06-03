import { Resend } from "resend";
import { signupTemplate, loginTemplate, otpTemplate, forgotPasswordTemplate, resetPasswordSuccessTemplate, logoutTemplate, } from "./templates/auth.templates.js";
import { depositTemplate, withdrawalTemplate, budgetAddedTemplate, budgetRemovedTemplate, budgetDepositTemplate, budgetWithdrawTemplate, goalAddedTemplate, goalRemovedTemplate, goalDepositTemplate, goalWithdrawTemplate, } from "./templates/finance.templates.js";
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "TrackNest <noreply@believetechhub.com>";
// ─── Core send helper ─────────────────────────────────────────────────────────
async function send(to, subject, html) {
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
export const sendSignupEmail = (to, firstName) => send(to, "Welcome to TrackNest 🎉", signupTemplate(firstName));
export const sendLoginEmail = (to, firstName, ipAddress) => {
    const loginTime = new Date().toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
    });
    return send(to, "New login to your TrackNest account", loginTemplate(firstName, loginTime, ipAddress));
};
export const sendOtpEmail = async (to, firstName, otp, expiresInMinutes = 10) => {
    try {
        // 3. Generate HTML using the template
        const htmlContent = otpTemplate(firstName, otp, expiresInMinutes);
        // 4. Send email
        await send(to, `${otp} is your TrackNest verification code`, htmlContent);
    }
    catch (err) {
        console.error("Failed to send OTP email:", err);
        throw err;
    }
};
export const sendForgotPasswordEmail = (to, firstName, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    return send(to, "Reset your TrackNest password", forgotPasswordTemplate(firstName, resetUrl));
};
export const sendResetPasswordSuccessEmail = (to, firstName) => send(to, "Your password has been changed", resetPasswordSuccessTemplate(firstName));
export const sendLogoutEmail = (to, firstName) => {
    const logoutTime = new Date().toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
    });
    return send(to, "You've been logged out of TrackNest", logoutTemplate(firstName, logoutTime));
};
// ─── Transactions ─────────────────────────────────────────────────────────────
export const sendDepositEmail = (to, firstName, amount, newBalance, ref) => send(to, "Deposit successful 💰", depositTemplate(firstName, amount, newBalance, ref));
export const sendWithdrawalEmail = (to, firstName, amount, newBalance, ref) => send(to, "Withdrawal processed", withdrawalTemplate(firstName, amount, newBalance, ref));
// ─── Budget ───────────────────────────────────────────────────────────────────
export const sendBudgetAddedEmail = (to, firstName, budgetName, limit) => send(to, `Budget "${budgetName}" created`, budgetAddedTemplate(firstName, budgetName, limit));
export const sendBudgetRemovedEmail = (to, firstName, budgetName) => send(to, `Budget "${budgetName}" removed`, budgetRemovedTemplate(firstName, budgetName));
export const sendBudgetDepositEmail = (to, firstName, budgetName, amount, budgetBalance) => send(to, `Funds added to "${budgetName}" budget`, budgetDepositTemplate(firstName, budgetName, amount, budgetBalance));
export const sendBudgetWithdrawEmail = (to, firstName, budgetName, amount, mainBalance) => send(to, `Funds moved from "${budgetName}" to main account`, budgetWithdrawTemplate(firstName, budgetName, amount, mainBalance));
// ─── Goal ─────────────────────────────────────────────────────────────────────
export const sendGoalAddedEmail = (to, firstName, goalName, targetAmount, deadline) => send(to, `Goal "${goalName}" created 🎯`, goalAddedTemplate(firstName, goalName, targetAmount, deadline));
export const sendGoalRemovedEmail = (to, firstName, goalName) => send(to, `Goal "${goalName}" removed`, goalRemovedTemplate(firstName, goalName));
export const sendGoalDepositEmail = (to, firstName, goalName, amount, savedSoFar, targetAmount) => send(to, `Progress update on "${goalName}" 🎯`, goalDepositTemplate(firstName, goalName, amount, savedSoFar, targetAmount));
export const sendGoalWithdrawEmail = (to, firstName, goalName, amount, mainBalance) => send(to, `Funds moved from goal "${goalName}"`, goalWithdrawTemplate(firstName, goalName, amount, mainBalance));
//# sourceMappingURL=emailService.js.map