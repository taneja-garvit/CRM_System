import express from 'express';
import CommunicationLog from '../models/CommunicationLog.js';
import authMiddleware from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { getDeliveryLogs } from '../controllers/deliveryController.js';

const router = express.Router();

/**
 * @swagger
 * /delivery:
 *   get:
 *     summary: Fetch all delivery logs
 *     responses:
 *       200:
 *         description: Delivery logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       campaignId: { type: string }
 *                       customerId: { type: string }
 *                       customerEmail: { type: string }
 *                       message: { type: string }
 *                       status: { type: string, enum: ['SENT', 'FAILED', 'PENDING'] }
 *                       createdAt: { type: string, format: date-time }
 *                       error: { type: string }
 *       401: { description: Unauthorized }
 *       500: { description: Internal server error }
 */

router.get('/', authMiddleware, getDeliveryLogs);


export default router;
