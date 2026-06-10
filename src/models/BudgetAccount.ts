import mongoose, { Schema, type Document, type ObjectId } from "mongoose";

export interface IBudgetItem {
  title: string;
  amount: number;
  spent: number;
}

export interface IBudget extends Document {
  userId: ObjectId;
  title: string;
  totalBudget: number;
  totalSpent: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  items: IBudgetItem[];
  status: "active" | "over";
  createdAt: Date;
  updatedAt: Date;
}

const BudgetItemSchema = new Schema<IBudgetItem>(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    totalBudget: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    items: [BudgetItemSchema],
    status: { type: String, enum: ["active", "over"], default: "active" },
  },
  { timestamps: true },
);

BudgetSchema.pre<IBudget>("save", function (next) {
  this.totalBudget = this.items.reduce((sum, i) => sum + i.amount, 0);
  this.totalSpent = this.items.reduce((sum, i) => sum + i.spent, 0);
  this.status = this.totalSpent >= this.totalBudget ? "over" : "active";
});

export default mongoose.model<IBudget>("Budget", BudgetSchema);
