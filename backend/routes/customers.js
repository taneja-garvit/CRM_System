import express from 'express';
import { createCustomer, getCustomers, segmentCustomers } from '../controllers/customerController.js';
import authMiddleware from '../middleware/auth.js';
import { validateCustomer } from '../middleware/validate.js';
import axios from 'axios'
import Customer from '../models/Customer.js';


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

router.post('/segment', authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find().lean();
    if (!customers || customers.length === 0) {
      return res.status(200).json({ message: 'No customers found', customers: [] });
    }

    const segmentedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const prompt = `Analyze customer data and suggest a segment (e.g., High Spender, Frequent Visitor, Inactive User). Customer data: totalSpend=$${customer.totalSpend}, visits=${customer.visits}, lastActive=${customer.lastActive}.`;
        
        const aiResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a marketing assistant that segments customers based on their data.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 20,
            temperature: 0.5,
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const segment = aiResponse.data.choices[0].message.content.trim();
        return { ...customer, segment };
      })
    );

    console.log('Customers segmented with AI');
    res.status(200).json({ message: 'Customers segmented successfully', customers: segmentedCustomers });
  } catch (error) {
    console.log('Error segmenting customers with Open AI:', error.message);
    res.status(500).json({ error: 'Failed to segment customers with AI' });
  }
});
router.post('/segment', authMiddleware, segmentCustomers);


export default router;
