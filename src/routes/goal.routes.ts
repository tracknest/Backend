// routes/goal.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.ts";
import goalController from "../controllers/account/goal.controller.ts";

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Goal
 *     description: Savings goal management endpoints
 */

/**
 * @openapi
 * /api/v1/goal:
 *   post:
 *     tags: [Goal]
 *     summary: Create a new savings goal
 *     description: Creates a goal with a title, target amount, and duration. Start and end dates are auto-calculated from today.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, targetAmount, durationInDays]
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Laptop
 *               targetAmount:
 *                 type: number
 *                 example: 500000
 *               durationInDays:
 *                 type: integer
 *                 minimum: 1
 *                 example: 90
 *     responses:
 *       201:
 *         description: Goal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Goal created
 *                 goal:
 *                   $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: title, targetAmount, and durationInDays are required
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 *   get:
 *     tags: [Goal]
 *     summary: Get all savings goals for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of goals returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Goal'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.post("/", goalController.create);
router.get("/", goalController.getAll);

/**
 * @openapi
 * /api/v1/goal/{id}:
 *   get:
 *     tags: [Goal]
 *     summary: Get a single savings goal by ID
 *     description: Returns the goal along with calculated progress percentage and remaining amount.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a7f9c2e4b0a12345678902
 *     responses:
 *       200:
 *         description: Goal returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 goal:
 *                   $ref: '#/components/schemas/Goal'
 *                 progress:
 *                   type: string
 *                   description: Percentage of target reached
 *                   example: "43.2%"
 *                 remaining:
 *                   type: number
 *                   description: Amount still needed to reach target
 *                   example: 284000
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Goal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Goal not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags: [Goal]
 *     summary: Delete a savings goal
 *     description: |
 *       A goal can **only** be deleted once its status is `completed` (target fully reached).
 *       Use the `/redo` endpoint to reset an active goal instead.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a7f9c2e4b0a12345678902
 *     responses:
 *       200:
 *         description: Goal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Goal deleted
 *       400:
 *         description: Goal has not been completed yet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Goal can only be deleted once the target is reached. Use redo to reset it instead.
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Goal not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", goalController.getOne);
router.delete("/:id", goalController.delete);

/**
 * @openapi
 * /api/v1/goal/{id}/deposit:
 *   patch:
 *     tags: [Goal]
 *     summary: Deposit an amount toward a savings goal
 *     description: |
 *       Adds to the goal's currentAmount. If currentAmount reaches or exceeds
 *       targetAmount, the goal is automatically capped and marked as `completed`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a7f9c2e4b0a12345678902
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Must be a positive number
 *                 example: 25000
 *     responses:
 *       200:
 *         description: Deposit recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deposit recorded
 *                 goal:
 *                   $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Missing or invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A positive amount is required
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Goal not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/deposit", goalController.deposit);

/**
 * @openapi
 * /api/v1/goal/{id}/redo:
 *   post:
 *     tags: [Goal]
 *     summary: Reset a savings goal
 *     description: |
 *       Resets `currentAmount` to 0 and recalculates the end date from today
 *       using the original `durationInDays`. Only allowed on **active** (incomplete) goals.
 *       Completed goals must be deleted instead.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a7f9c2e4b0a12345678902
 *     responses:
 *       200:
 *         description: Goal reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Goal has been reset
 *                 goal:
 *                   $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Goal is already completed — cannot be redone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Completed goals cannot be redone. Delete it instead.
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       404:
 *         description: Goal not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/redo", goalController.redo);

/**
 * @openapi
 * components:
 *   schemas:
 *     Goal:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a7f9c2e4b0a12345678902
 *         userId:
 *           type: string
 *           example: 64a7f9c2e4b0a12345678900
 *         title:
 *           type: string
 *           example: New Laptop
 *         targetAmount:
 *           type: number
 *           example: 500000
 *         currentAmount:
 *           type: number
 *           example: 216000
 *         durationInDays:
 *           type: integer
 *           example: 90
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: 2024-08-01T00:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: 2024-10-30T00:00:00.000Z
 *         status:
 *           type: string
 *           enum: [active, completed]
 *           example: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;
