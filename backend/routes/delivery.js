const express = require('express');
const CommunicationLog = require('../models/CommunicationLog');
const authMiddleware = require('../middleware/auth');
const { logger } = require('../utils/logger');

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
router.get('/', authMiddleware, async (req, res) => {
  try {
    const logs = await CommunicationLog.find()
      .populate('campaignId', 'message')
      .populate('customerId', 'email')
      .lean();
    logger.info('Fetched delivery logs');
    res.status(200).json({ message: 'Delivery logs fetched successfully', logs });
  } catch (error) {
    logger.error('Error fetching delivery logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;