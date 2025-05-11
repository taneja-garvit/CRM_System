import express from 'express';
import { createCampaign, generateMessage, getCampaignHistory } from '../controllers/campaignController.js';
import authMiddleware from '../middleware/auth.js';
import { validateCampaign } from '../middleware/validate.js';
import axios from 'axios'

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




router.post('/generate-message', authMiddleware, generateMessage);


export default router;
