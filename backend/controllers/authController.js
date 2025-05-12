import passport from 'passport';
import { logger } from '../utils/logger.js';
import User from '../models/User.js';


export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'], session: false });

const frontend = process.env.FRONTEND_URL

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, data) => {
    if (err) {
      logger.error('Authentication error:', err);
      return res.status(401).json({ error: 'Authentication failed', details: err.message });
    }

    if (!data) {
      logger.error('No data returned from Google OAuth');
      return res.status(401).json({ error: 'Authentication failed' });
    }

    logger.info(`Authentication successful for user: ${data.user.email}`);

    // Store data in req.user for the success handler
    req.user = data;

    // Call next to proceed to the success handler
    next();
  })(req, res, next);
};

export const getUser = (req, res) => {
  res.json({ user: req.user });
};

export const success = (req, res) => {
  if (!req.user) {
    logger.error('No user found in auth callback');
    return res.status(401).json({ error: 'Authentication failed' });
  }
  const { token } = req.user;
  console.log(token);

    if (!frontend) {
    console.log('FRONTEND_URL is not defined in environment variables.');
    return res.status(500).send('Server misconfiguration: frontend URL missing');
  }

  // Redirect to frontend with token as query parameter
  // res.redirect(`${frontend}/login?token=${token}`);
  res.json({
    success,
    token
  })
};

export const getUsers = async (req, res) => {
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
};
