import { baseTemplate } from "./base.ts";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    amount,
  );

const formatDate = (date?: Date) =>
  (date ?? new Date()).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

// ─── Main Account ────────────────────────────────────────────────────────────

export const depositTemplate = (
  firstName: string,
  amount: number,
  newBalance: number,
  ref?: string,
) =>
  baseTemplate(
    `
    <p class="greeting">Deposit successful 💰</p>
    <p class="text">Hi ${firstName}, your TrackNest account has been credited.</p>
    <div class="card">
      <div class="card-row"><span class="label">Amount</span><span class="amount-positive">+${formatCurrency(amount)}</span></div>
      <div class="card-row"><span class="label">New Balance</span><span class="value">${formatCurrency(newBalance)}</span></div>
      <div class="card-row"><span class="label">Date</span><span class="value">${formatDate()}</span></div>
      ${ref ? `<div class="card-row"><span class="label">Reference</span><span class="value">${ref}</span></div>` : ""}
      <div class="card-row"><span class="label">Status</span><span class="badge badge-green">Successful</span></div>
    </div>
  `,
    `You deposited ${formatCurrency(amount)} into your TrackNest account.`,
  );

export const withdrawalTemplate = (
  firstName: string,
  amount: number,
  newBalance: number,
  ref?: string,
) =>
  baseTemplate(
    `
    <p class="greeting">Withdrawal processed</p>
    <p class="text">Hi ${firstName}, a withdrawal has been made from your TrackNest account.</p>
    <div class="card">
      <div class="card-row"><span class="label">Amount</span><span class="amount-negative">-${formatCurrency(amount)}</span></div>
      <div class="card-row"><span class="label">New Balance</span><span class="value">${formatCurrency(newBalance)}</span></div>
      <div class="card-row"><span class="label">Date</span><span class="value">${formatDate()}</span></div>
      ${ref ? `<div class="card-row"><span class="label">Reference</span><span class="value">${ref}</span></div>` : ""}
      <div class="card-row"><span class="label">Status</span><span class="badge badge-green">Successful</span></div>
    </div>
    <div class="warning">⚠️ If you didn't authorize this, contact support immediately.</div>
  `,
    `Withdrawal of ${formatCurrency(amount)} from your TrackNest account.`,
  );

// ─── Budget ───────────────────────────────────────────────────────────────────

export const budgetAddedTemplate = (
  firstName: string,
  budgetName: string,
  limit: number,
) =>
  baseTemplate(
    `
    <p class="greeting">Budget created 📊</p>
    <p class="text">Hi ${firstName}, your new budget has been set up.</p>
    <div class="card">
      <div class="card-row"><span class="label">Budget Name</span><span class="value">${budgetName}</span></div>
      <div class="card-row"><span class="label">Limit</span><span class="value">${formatCurrency(limit)}</span></div>
      <div class="card-row"><span class="label">Created</span><span class="value">${formatDate()}</span></div>
      <div class="card-row"><span class="label">Status</span><span class="badge badge-green">Active</span></div>
    </div>
    <a href="${process.env.CLIENT_URL}/budgets" class="btn">View Budgets →</a>
  `,
    `New budget "${budgetName}" created on TrackNest.`,
  );

export const budgetRemovedTemplate = (firstName: string, budgetName: string) =>
  baseTemplate(
    `
    <p class="greeting">Budget removed</p>
    <p class="text">Hi ${firstName}, your budget <strong>${budgetName}</strong> has been deleted from TrackNest.</p>
    <p class="text">Any funds that were allocated to this budget have been returned to your main balance.</p>
    <a href="${process.env.CLIENT_URL}/budgets" class="btn">View Budgets →</a>
  `,
    `Budget "${budgetName}" was removed from TrackNest.`,
  );

export const budgetDepositTemplate = (
  firstName: string,
  budgetName: string,
  amount: number,
  budgetBalance: number,
) =>
  baseTemplate(
    `
    <p class="greeting">Funds added to budget 📊</p>
    <p class="text">Hi ${firstName}, you've moved funds into your <strong>${budgetName}</strong> budget.</p>
    <div class="card">
      <div class="card-row"><span class="label">Budget</span><span class="value">${budgetName}</span></div>
      <div class="card-row"><span class="label">Added</span><span class="amount-positive">+${formatCurrency(amount)}</span></div>
      <div class="card-row"><span class="label">Budget Balance</span><span class="value">${formatCurrency(budgetBalance)}</span></div>
      <div class="card-row"><span class="label">Date</span><span class="value">${formatDate()}</span></div>
    </div>
  `,
    `${formatCurrency(amount)} added to "${budgetName}" budget.`,
  );

export const budgetWithdrawTemplate = (
  firstName: string,
  budgetName: string,
  amount: number,
  mainBalance: number,
) =>
  baseTemplate(
    `
    <p class="greeting">Funds moved to main account</p>
    <p class="text">Hi ${firstName}, you've moved funds from your <strong>${budgetName}</strong> budget back to your main account.</p>
    <div class="card">
      <div class="card-row"><span class="label">Budget</span><span class="value">${budgetName}</span></div>
      <div class="card-row"><span class="label">Withdrawn</span><span class="amount-negative">-${formatCurrency(amount)}</span></div>
      <div class="card-row"><span class="label">New Main Balance</span><span class="value">${formatCurrency(mainBalance)}</span></div>
      <div class="card-row"><span class="label">Date</span><span class="value">${formatDate()}</span></div>
    </div>
  `,
    `${formatCurrency(amount)} moved from "${budgetName}" to main account.`,
  );

// ─── Goal ─────────────────────────────────────────────────────────────────────

export const goalAddedTemplate = (
  firstName: string,
  goalName: string,
  targetAmount: number,
  deadline?: string,
) =>
  baseTemplate(
    `
    <p class="greeting">Goal created 🎯</p>
    <p class="text">Hi ${firstName}, you've set a new financial goal. Keep going!</p>
    <div class="card">
      <div class="card-row"><span class="label">Goal</span><span class="value">${goalName}</span></div>
      <div class="card-row"><span class="label">Target</span><span class="value">${formatCurrency(targetAmount)}</span></div>
      ${deadline ? `<div class="card-row"><span class="label">Deadline</span><span class="value">${deadline}</span></div>` : ""}
      <div class="card-row"><span class="label">Status</span><span class="badge badge-blue">In Progress</span></div>
    </div>
    <a href="${process.env.CLIENT_URL}/goals" class="btn">View Goals →</a>
  `,
    `New goal "${goalName}" created on TrackNest.`,
  );

export const goalRemovedTemplate = (firstName: string, goalName: string) =>
  baseTemplate(
    `
    <p class="greeting">Goal removed</p>
    <p class="text">Hi ${firstName}, your goal <strong>${goalName}</strong> has been removed from TrackNest.</p>
    <p class="text">Any funds saved towards this goal have been returned to your main balance.</p>
    <a href="${process.env.CLIENT_URL}/goals" class="btn">View Goals →</a>
  `,
    `Goal "${goalName}" was removed from TrackNest.`,
  );

export const goalDepositTemplate = (
  firstName: string,
  goalName: string,
  amount: number,
  savedSoFar: number,
  targetAmount: number,
) => {
  const progress = Math.min(Math.round((savedSoFar / targetAmount) * 100), 100);
  return baseTemplate(
    `
    <p class="greeting">Progress on your goal 🎯</p>
    <p class="text">Hi ${firstName}, you've added funds to your <strong>${goalName}</strong> goal.</p>
    <div class="card">
      <div class="card-row"><span class="label">Goal</span><span class="value">${goalName}</span></div>
      <div class="card-row"><span class="label">Added</span><span class="amount-positive">+${formatCurrency(amount)}</span></div>
      <div class="card-row"><span class="label">Saved So Far</span><span class="value">${formatCurrency(savedSoFar)}</span></div>
      <div class="card-row"><span class="label">Target</span><span class="value">${formatCurrency(targetAmount)}</span></div>
      <div class="card-row"><span class="label">Progress</span><span class="badge badge-${progress >= 100 ? "green" : "blue"}">${progress}%</span></div>
    </div>
    ${progress >= 100 ? `<p class="text" style="color:#22c55e; font-weight:600; text-align:center;">🎉 Congratulations! You've reached your goal!</p>` : ""}
  `,
    `${formatCurrency(amount)} added to goal "${goalName}".`,
  );
};

export const goalWithdrawTemplate = (
  firstName: string,
  goalName: string,
  amount: number,
  mainBalance: number,
) =>
  baseTemplate(
    `
    <p class="greeting">Funds moved from goal</p>
    <p class="text">Hi ${firstName}, you've moved funds from your <strong>${goalName}</strong> goal back to your main account.</p>
    <div class="card">
      <div class="card-row"><span class="label">Goal</span><span class="value">${goalName}</span></div>
      <div class="card-row"><span class="label">Withdrawn</span><span class="amount-negative">-${formatCurrency(amount)}</span></div>
      <div class="card-row"><span class="label">New Main Balance</span><span class="value">${formatCurrency(mainBalance)}</span></div>
      <div class="card-row"><span class="label">Date</span><span class="value">${formatDate()}</span></div>
    </div>
  `,
    `${formatCurrency(amount)} moved from goal "${goalName}" to main account.`,
  );
