const express = require('express');
const { createCustomer, getCustomers } = require('../controllers/customerController');
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

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Fetch all customers
 *     responses:
 *       200:
 *         description: Customers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 customers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       name: { type: string }
 *                       email: { type: string }
 *                       totalSpend: { type: number }
 *                       visits: { type: number }
 *                       lastActive: { type: string, format: date-time }
 *       500: { description: Internal server error }
 */
router.get('/', authMiddleware, getCustomers);

module.exports = router;