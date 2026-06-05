export interface CreateGoalDTO {
  title: string;
  targetAmount: number;
  durationInDays: number; 
}

export interface DepositGoalDTO {
  amount: number;
}