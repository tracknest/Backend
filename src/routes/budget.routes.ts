// routes/budget.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.ts";
import budgetController from "../controllers/account/budget.controller.ts";

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Budget
 *     description: Budget management endpoints
 */

/**
 * @openapi
 * /api/v1/budget:
 *   post:
 *     tags: [Budget]
 *     summary: Create a new budget
 *     description: Creates a budget with a title, period, and a list of spending items. The totalBudget is auto-calculated from all item amounts.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, period, items]
 *             properties:
 *               title:
 *                 type: string
 *                 example: August Budget
 *               period:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *                 example: monthly
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [title, amount]
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: Groceries
 *                     amount:
 *                       type: number
 *                       example: 50000
 *     responses:
 *       201:
 *         description: Budget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Budget created
 *                 budget:
 *                   $ref: '#/components/schemas/Budget'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: title, period, and at least one item are required
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 *   get:
 *     tags: [Budget]
 *     summary: Get all budgets for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Budget'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.post("/", budgetController.create);
router.get("/", budgetController.getAll);

/**
 * @openapi
 * /api/v1/budget/{id}:
 *   get:
 *     tags: [Budget]
 *     summary: Get a single budget by ID
 *     description: Returns the budget along with its items sorted by most spent (descending).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *         example: 64a7f9c2e4b0a12345678901
 *     responses:
 *       200:
 *         description: Budget returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 budget:
 *                   $ref: '#/components/schemas/Budget'
 *                 mostSpent:
 *                   type: array
 *                   description: Budget items sorted by spent amount descending
 *                   items:
 *                     $ref: '#/components/schemas/BudgetItem'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Budget not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Budget not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags: [Budget]
 *     summary: Update a budget
 *     description: Update the title, period, or items of an existing budget. Totals and status are recalculated automatically on save.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a7f9c2e4b0a12345678901
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Budget Title
 *               period:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *                 example: weekly
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [title, amount]
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: Transport
 *                     amount:
 *                       type: number
 *                       example: 20000
 *                     spent:
 *                       type: number
 *                       example: 5000
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Budget updated
 *                 budget:
 *                   $ref: '#/components/schemas/Budget'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Budget not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags: [Budget]
 *     summary: Delete a budget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a7f9c2e4b0a12345678901
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Budget deleted
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Budget not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", budgetController.getOne);
router.patch("/:id", budgetController.update);
router.delete("/:id", budgetController.delete);

/**
 * @openapi
 * /api/v1/budget/{id}/spend:
 *   patch:
 *     tags: [Budget]
 *     summary: Record spending on a budget item
 *     description: |
 *       Adds to the `spent` value of a specific item inside the budget.
 *       totalSpent and status are recalculated automatically.
 *       Status becomes "over" when totalSpent >= totalBudget.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a7f9c2e4b0a12345678901
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemTitle, amount]
 *             properties:
 *               itemTitle:
 *                 type: string
 *                 description: Must exactly match the title of an existing budget item
 *                 example: Groceries
 *               amount:
 *                 type: number
 *                 description: Amount spent — must be a positive number
 *                 example: 15000
 *     responses:
 *       200:
 *         description: Spend recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spend recorded
 *                 budget:
 *                   $ref: '#/components/schemas/Budget'
 *       400:
 *         description: Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: itemTitle and a positive amount are required
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Budget or item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Budget not found
 *                     - Item "Groceries" not found in budget
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/spend", budgetController.recordSpend);

/**
 * @openapi
 * components:
 *   schemas:
 *     BudgetItem:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Groceries
 *         amount:
 *           type: number
 *           example: 50000
 *         spent:
 *           type: number
 *           example: 15000
 *     Budget:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a7f9c2e4b0a12345678901
 *         userId:
 *           type: string
 *           example: 64a7f9c2e4b0a12345678900
 *         title:
 *           type: string
 *           example: August Budget
 *         period:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           example: monthly
 *         totalBudget:
 *           type: number
 *           example: 150000
 *         totalSpent:
 *           type: number
 *           example: 45000
 *         status:
 *           type: string
 *           enum: [active, over]
 *           example: active
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BudgetItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;