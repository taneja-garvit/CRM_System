import passport from 'passport';
import { logger } from '../utils/logger.js';
import User from '../models/User.js';

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'], session: false });

const frontend = process.env.FRONTEND_URL;

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

    req.user = data;
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
  logger.info(`Sending token to frontend: ${token}`);

  // Render an HTML page that sends the token to the parent window and closes the popup
  res.send(`
    <html>
      <body>
        <script>
          window.opener.postMessage({
            success: true,
            token: "${token}"
          }, "${frontend}");
          window.close();
        </script>
      </body>
    </html>
  `);
};

export const getUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.error('User not found for ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info(`Fetched user: ${user._id}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};