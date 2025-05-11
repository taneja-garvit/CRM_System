import express from 'express';
import passport from 'passport';
import { getUsers, googleAuth, googleCallback, success } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     responses:
 *       302: { description: Redirect to Google login }
 */
router.get('/google', googleAuth);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     responses:
 *       302: { description: Redirect to frontend with JWT token }
 */
router.get('/google/callback', googleCallback, success);

/**
 * @swagger
 * /auth/success:
 *   get:
 *     summary: Authentication success redirect
 *     responses:
 *       302: { description: Redirect to frontend with JWT token }
 */
router.get('/success', success);


router.get('/user', authMiddleware, getUsers);


export default router;
