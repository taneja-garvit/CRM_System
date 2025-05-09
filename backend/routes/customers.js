const express = require('express');
const { createCustomer } = require('../controllers/customerController');
const authMiddleware = require('../middleware/auth');
const { validateCustomer } = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Ingest customer data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               totalSpend: { type: number }
 *               visits: { type: number }
 *               lastActive: { type: string, format: date-time }
 *     responses:
 *       201: { description: Customer created successfully }
 *       400: { description: Validation error or duplicate email }
 */
router.post('/', authMiddleware, validateCustomer, createCustomer);

module.exports = router;