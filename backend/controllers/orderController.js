import Order from '../models/Order.js';
import { logger } from '../utils/logger.js';

export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const order = new Order(orderData);
    await order.save();
    logger.info(`Order ${order._id} created`);
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
