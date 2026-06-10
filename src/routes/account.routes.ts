// routes/account.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.ts";
import accountController from "../controllers/account/main.controller.ts";

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Account
 *     description: Main account summary endpoints
 */

/**
 * @openapi
 * /api/v1/account/summary:
 *   get:
 *     tags: [Account]
 *     summary: Get account summary for a given period
 *     description: |
 *       Returns an aggregated financial overview for the current user filtered
 *       by the selected period. All budgets and goals created within the period
 *       date range are included in the calculation.
 *
 *       | Field | Description |
 *       |---|---|
 *       | `totalBudgetAmount` | Sum of all budget `totalBudget` values in the period |
 *       | `totalAmountSpent` | Sum of all budget `totalSpent` values in the period |
 *       | `totalSavingGoalAmount` | Sum of all goal `targetAmount` values in the period |
 *       | `totalDeposited` | Sum of all goal `currentAmount` values in the period |
 *       | `totalBalance` | `totalBudgetAmount − totalAmountSpent − totalDeposited` |
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: false
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period to filter the summary by. Defaults to current month.
 *         example: month
 *     responses:
 *       200:
 *         description: Account summary returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   enum: [day, week, month, year]
 *                   example: month
 *                 range:
 *                   type: object
 *                   description: The date range used for filtering
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-08-01T00:00:00.000Z
 *                     to:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-08-31T23:59:59.999Z
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalBudgetAmount:
 *                       type: number
 *                       description: Total amount budgeted across all budgets in the period
 *                       example: 350000
 *                     totalAmountSpent:
 *                       type: number
 *                       description: Total amount spent across all budgets in the period
 *                       example: 120000
 *                     totalSavingGoalAmount:
 *                       type: number
 *                       description: Total target amount across all goals in the period
 *                       example: 500000
 *                     totalDeposited:
 *                       type: number
 *                       description: Total amount deposited toward goals in the period
 *                       example: 216000
 *                     totalBalance:
 *                       type: number
 *                       description: Remaining balance after spending and saving (totalBudgetAmount - totalAmountSpent - totalDeposited)
 *                       example: 14000
 *                 budgetCount:
 *                   type: integer
 *                   description: Number of budgets in the period
 *                   example: 3
 *                 goalCount:
 *                   type: integer
 *                   description: Number of goals in the period
 *                   example: 2
 *       400:
 *         description: Invalid period value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: period must be one of: day, week, month, year
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get("/summary", accountController.getSummary);

export default router;
