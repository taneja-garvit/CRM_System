const express = require('express');
const { updateDeliveryStatus } = require('../controllers/deliveryController');

const router = express.Router();

/**
 * @swagger
 * /delivery/receipt:
 *   post:
 *     summary: Update delivery status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId: { type: string }
 *               customerId: { type: string }
 *               status: { type: string, enum: ['SENT', 'FAILED'] }
 *     responses:
 *       200: { description: Delivery status updated }
 */
router.post('/receipt', updateDeliveryStatus);

module.exports = router;