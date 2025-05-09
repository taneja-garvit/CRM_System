const redis = require('redis');
const { logger } = require('../utils/logger');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis connection refused, retrying...');
      return 1000; // Retry after 1 second
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Max Redis retry attempts reached');
      return new Error('Max retry attempts reached');
    }
    return Math.min(options.attempt * 100, 3000); // Exponential backoff
  },
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

redisClient.connect().catch((err) => {
  logger.error('Redis initial connection failed:', err);
});

module.exports = redisClient;