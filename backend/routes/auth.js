const express = require('express');
const passport = require('passport');
const { googleAuth, googleCallback, success } = require('../controllers/authController');

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

module.exports = router;