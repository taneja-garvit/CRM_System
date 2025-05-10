import express from 'express';
import { createCampaign, getCampaignHistory } from '../controllers/campaignController.js';
import authMiddleware from '../middleware/auth.js';
import { validateCampaign } from '../middleware/validate.js';

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

export default router;
