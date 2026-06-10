// dto/budget.dto.ts
export interface CreateBudgetDTO {
  title: string;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
}

export interface UpdateBudgetDTO {
  title?: string;
  amount?: number;
  period?: "daily" | "weekly" | "monthly" | "yearly";
}
