const express = require('express');
const { createCampaign, getCampaignHistory } = require('../controllers/campaignController');
const authMiddleware = require('../middleware/auth');
const { validateCampaign } = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Create a new campaign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               segmentRules: { type: object }
 *               message: { type: string }
 *     responses:
 *       201: { description: Campaign created }
 */
router.post('/', authMiddleware, validateCampaign, createCampaign);

/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: Get campaign history
 *     responses:
 *       200: { description: List of campaigns }
 */
router.get('/', authMiddleware, getCampaignHistory);

module.exports = router;