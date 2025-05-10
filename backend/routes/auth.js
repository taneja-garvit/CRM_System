import express from 'express';
import passport from 'passport';
import { googleAuth, googleCallback, success } from '../controllers/authController.js';
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

router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`Fetched user: ${user._id}`);
    res.status(200).json(user);
  } catch (error) {
    console.log('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
