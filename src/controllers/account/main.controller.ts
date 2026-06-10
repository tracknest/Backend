import type { Request, Response } from "express";
import BudgetAccount from "../../models/BudgetAccount.ts";
import GoalAccountModel from "../../models/GoalAccount.model.ts";

type Period = "day" | "week" | "month" | "year";

function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (period === "week") {
    const day = now.getDay();
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else if (period === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export const accountController = {
  getSummary: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id || (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const period = (req.query.period as Period) || "month";
      const validPeriods: Period[] = ["day", "week", "month", "year"];
      if (!validPeriods.includes(period)) {
        res
          .status(400)
          .json({ message: "period must be one of: day, week, month, year" });
        return;
      }

      const { start, end } = getPeriodRange(period);

      // Fetch budgets and goals created within the period
      const [budgets, goals] = await Promise.all([
        BudgetAccount.find({ userId, createdAt: { $gte: start, $lte: end } }),
        GoalAccountModel.find({
          userId,
          createdAt: { $gte: start, $lte: end },
        }),
      ]);

      const totalBudgetAmount = budgets.reduce(
        (sum, b) => sum + b.totalBudget,
        0,
      );
      const totalAmountSpent = budgets.reduce(
        (sum, b) => sum + b.totalSpent,
        0,
      );

      const totalSavingGoalAmount = goals.reduce(
        (sum, g) => sum + g.targetAmount,
        0,
      );
      const totalDeposited = goals.reduce((sum, g) => sum + g.currentAmount, 0);

      const budgetRemaining = totalBudgetAmount - totalAmountSpent;
      const goalRemaining = totalSavingGoalAmount - totalDeposited;

      res.status(200).json({
        period,
        range: { from: start, to: end },
        summary: {
          totalBudgetAmount,
          totalAmountSpent,
          budgetRemaining,
          totalSavingGoalAmount,
          totalDeposited,
          goalRemaining,
        },
        budgetCount: budgets.length,
        goalCount: goals.length,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default accountController;
