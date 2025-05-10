import redisClient from '../config/redis.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { logger } from '../utils/logger.js';

const GROUP_NAME = 'xeno-crm-group';
const CONSUMER_NAME = 'consumer-1';

// Initialize consumer group
async function initConsumerGroup() {
  try {
    await redisClient.xGroupCreate('customer:stream', GROUP_NAME, '0', { MKSTREAM: true });
    logger.info('Customer stream group created');
  } catch (error) {
    if (!error.message.includes('BUSYGROUP')) {
      logger.error('Error creating customer stream group:', error);
    }
  }
  
  try {
    await redisClient.xGroupCreate('order:stream', GROUP_NAME, '0', { MKSTREAM: true });
    logger.info('Order stream group created');
  } catch (error) {
    if (!error.message.includes('BUSYGROUP')) {
      logger.error('Error creating order stream group:', error);
    }
  }
}

const processCustomerStream = async () => {
  await initConsumerGroup();
  while (true) {
    try {
      const messages = await redisClient.xReadGroup(GROUP_NAME, CONSUMER_NAME, {
        streams: { 'customer:stream': '>' },
        count: 10,
        block: 1000,
      });
      
      if (messages && messages.length > 0) {
        for (const message of messages[0].messages) {
          try {
            const data = JSON.parse(message.message.data);
            const customer = new Customer(data);
            await customer.save();
            await redisClient.xAck('customer:stream', GROUP_NAME, message.id);
            logger.info(`Processed customer ${customer._id}, message ID: ${message.id}`);
          } catch (error) {
            logger.error(`Error processing customer message ${message.id}:`, error);
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // Avoid tight loop
    } catch (error) {
      logger.error('Error reading customer stream:', error);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Retry after delay
    }
  }
};

const processOrderStream = async () => {
  await initConsumerGroup();
  while (true) {
    try {
      const messages = await redisClient.xReadGroup(GROUP_NAME, CONSUMER_NAME, {
        streams: { 'order:stream': '>' },
        count: 10,
        block: 1000,
      });
      
      if (messages && messages.length > 0) {
        for (const message of messages[0].messages) {
          try {
            const data = JSON.parse(message.message.data);
            const order = new Order(data);
            await order.save();
            await redisClient.xAck('order:stream', GROUP_NAME, message.id);
            logger.info(`Processed order ${order._id}, message ID: ${message.id}`);
          } catch (error) {
            logger.error(`Error processing order message ${message.id}:`, error);
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // Avoid tight loop
    } catch (error) {
      logger.error('Error reading order stream:', error);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Retry after delay
    }
  }
};

export { processCustomerStream, processOrderStream };
