import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';
import { validateOrder } from '../middleware/validate.js';

const router = express.Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Ingest order data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId: { type: string }
 *               amount: { type: number }
 *               date: { type: string, format: date-time }
 *     responses:
 *       201: { description: Order created successfully }
 *       400: { description: Validation error }
 */
router.post('/', authMiddleware, validateOrder, createOrder);

export default router;
