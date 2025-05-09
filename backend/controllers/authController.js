const passport = require('passport');
const { logger } = require('../utils/logger');

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'], session: false });

exports.googleCallback = (req, res, next) => {
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

exports.getUser = (req, res) => {
  res.json({ user: req.user });
};
exports.success = (req, res) => {
  if (!req.user) {
    logger.error('No user found in auth callback');
    return res.status(401).json({ error: 'Authentication failed' });
  }
  const { token } = req.user;
  console.log(token)
  // Redirect to frontend with token as query parameter
  res.redirect(`http://localhost:8080/login?token=${token}`);
};