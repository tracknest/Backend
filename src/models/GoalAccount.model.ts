import mongoose, { Schema, type Document, type ObjectId} from "mongoose";

export interface IGoal extends Document {
  userId: ObjectId;
  title: string;
  targetAmount: number;
  currentAmount: number;
  durationInDays: number;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    durationInDays: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model<IGoal>("Goal", GoalSchema);