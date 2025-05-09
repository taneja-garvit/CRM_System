const express = require('express');
const { createOrder } = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

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

module.exports = router;