import type { Request, Response } from "express";
import type { CreateBudgetDTO, UpdateBudgetDTO } from "../../dto/budget.dto.ts";
import { Types } from "mongoose";
import BudgetAccount from "../../models/BudgetAccount.ts";

const toObjectId = (id: string | string[] | undefined) =>
  new Types.ObjectId(String(id));

export const budgetController = {
  // POST /budgets
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { title, period } = req.body as CreateBudgetDTO;
      const items = (req.body as any)?.items;

      if (!title || !period || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          message: "title, period, and at least one item are required",
        });
        return;
      }

      const budget = new BudgetAccount({
        userId,
        title,
        period,
        items: items.map((i) => ({
          title: i.title,
          amount: i.amount,
          spent: 0,
        })),
      });

      await budget.save(); // pre-save hook calculates totalBudget, totalSpent, status

      res.status(201).json({ message: "Budget created", budget });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /budgets
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const budgets = await BudgetAccount.find({ userId }).sort({
        createdAt: -1,
      });
      res.status(200).json(budgets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /budgets/:id
  getOne: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const budget = await BudgetAccount.findOne({
        _id: toObjectId(req.params.id),
        userId,
      });
      if (!budget) {
        res.status(404).json({ message: "Budget not found" });
        return;
      }

      const mostSpent = [...budget.items].sort((a, b) => b.spent - a.spent);

      res.status(200).json({ budget, mostSpent });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // PATCH /budgets/:id
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const budget = await BudgetAccount.findOne({
        _id: toObjectId(req.params.id),
        userId,
      });
      if (!budget) {
        res.status(404).json({ message: "Budget not found" });
        return;
      }

      const { title, period } = req.body as Partial<UpdateBudgetDTO>;
      const items = (req.body as any)?.items;

      if (title) budget.title = title;
      if (period) budget.period = period;
      if (Array.isArray(items) && items.length > 0) {
        budget.items = items.map((i) => ({
          title: i.title,
          amount: i.amount,
          spent: i.spent ?? 0,
        }));
      }

      await budget.save(); // pre-save hook recalculates totals and status

      res.status(200).json({ message: "Budget updated", budget });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // PATCH /budgets/:id/spend
  recordSpend: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { itemTitle, amount } = req.body;
      if (!itemTitle || typeof amount !== "number" || amount <= 0) {
        res
          .status(400)
          .json({ message: "itemTitle and a positive amount are required" });
        return;
      }

      const budget = await BudgetAccount.findOne({
        _id: toObjectId(req.params.id),
        userId,
      });
      if (!budget) {
        res.status(404).json({ message: "Budget not found" });
        return;
      }

      const item = budget.items.find((i) => i.title === itemTitle);
      if (!item) {
        res
          .status(404)
          .json({ message: `Item "${itemTitle}" not found in budget` });
        return;
      }

      item.spent += amount;

      await budget.save(); // pre-save hook updates totalSpent and status

      res.status(200).json({ message: "Spend recorded", budget });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // DELETE /budgets/:id
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const budget = await BudgetAccount.findOneAndDelete({
        _id: toObjectId(req.params.id),
        userId,
      });
      if (!budget) {
        res.status(404).json({ message: "Budget not found" });
        return;
      }

      res.status(200).json({ message: "Budget deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default budgetController;
