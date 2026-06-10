import type { Request, Response } from "express";
import type { CreateGoalDTO, DepositGoalDTO } from "../../dto/goal.dto.ts";
import { Types } from "mongoose";
import GoalAccountModel from "../../models/GoalAccount.model.ts";

const toObjectId = (id: string | string[] | undefined) =>
  new Types.ObjectId(String(id));

export const goalController = {
  // POST /goals
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { title, targetAmount, durationInDays }: CreateGoalDTO = req.body;

      if (!title || !targetAmount || !durationInDays) {
        res.status(400).json({
          message: "title, targetAmount, and durationInDays are required",
        });
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationInDays);

      const goal = await GoalAccountModel.create({
        userId,
        title,
        targetAmount,
        durationInDays,
        startDate,
        endDate,
      });

      res.status(201).json({ message: "Goal created", goal });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /goals
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const goals = await GoalAccountModel.find({ userId }).sort({
        createdAt: -1,
      });
      res.status(200).json(goals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /goals/:id
  getOne: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const goal = await GoalAccountModel.findOne({
        _id: toObjectId(req.params.id),
        userId,
      });
      if (!goal) {
        res.status(404).json({ message: "Goal not found" });
        return;
      }

      const progress = Math.min(
        (goal.currentAmount / goal.targetAmount) * 100,
        100,
      );
      const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

      res
        .status(200)
        .json({ goal, progress: `${progress.toFixed(1)}%`, remaining });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // POST /goals/:id/deposit
  deposit: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { amount }: DepositGoalDTO = req.body;
      if (typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ message: "A positive amount is required" });
        return;
      }

      const goal = await GoalAccountModel.findOne({
        _id: toObjectId(req.params.id),
        userId,
      });
      if (!goal) {
        res.status(404).json({ message: "Goal not found" });
        return;
      }

      if (goal.status === "completed") {
        res.status(400).json({ message: "This goal is already completed." });
        return;
      }

      goal.currentAmount += amount;

      if (goal.currentAmount >= goal.targetAmount) {
        goal.currentAmount = goal.targetAmount;
        goal.status = "completed";
      }

      await goal.save();

      res.status(200).json({ message: "Deposit recorded", goal });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // PATCH /goals/:id/redo
  redo: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const goal = await GoalAccountModel.findOne({
        _id: toObjectId(req.params.id),
        userId,
      });
      if (!goal) {
        res.status(404).json({ message: "Goal not found" });
        return;
      }

      if (goal.status === "completed") {
        res.status(400).json({
          message: "Completed goals cannot be redone. Delete it instead.",
        });
        return;
      }

      goal.currentAmount = 0;
      goal.startDate = new Date();
      goal.endDate = new Date();
      goal.endDate.setDate(goal.endDate.getDate() + goal.durationInDays);

      await goal.save();

      res.status(200).json({ message: "Goal has been reset", goal });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // DELETE /goals/:id
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any)?.id ?? (req.user as any)?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const goal = await GoalAccountModel.findOne({
        _id: toObjectId(req.params.id),
        userId,
      });
      if (!goal) {
        res.status(404).json({ message: "Goal not found" });
        return;
      }

      if (goal.status !== "completed") {
        res.status(400).json({
          message:
            "Goal can only be deleted once the target is reached. Use redo to reset it instead.",
        });
        return;
      }

      await goal.deleteOne();

      res.status(200).json({ message: "Goal deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default goalController;
