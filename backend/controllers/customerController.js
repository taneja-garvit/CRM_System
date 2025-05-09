const Customer = require('../models/Customer');
const { logger } = require('../utils/logger');

exports.createCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    const customer = new Customer(customerData);
    await customer.save();
    logger.info(`Customer ${customer._id} created`);
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    logger.error('Error creating customer:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};