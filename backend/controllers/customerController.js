import Customer from '../models/Customer.js';
import { logger } from '../utils/logger.js';
import axios from 'axios';


export const createCustomer = async (req, res) => {
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

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    logger.info('Fetched all customers');
    res.status(200).json({ message: 'Customers fetched successfully', customers });
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const segmentCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().lean();
    if (!customers || customers.length === 0) {
      return res.status(200).json({ message: 'No customers found', customers: [] });
    }

    const segmentedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const prompt = `Analyze customer data and suggest a segment (e.g., High Spender, Frequent Visitor, Inactive User). Customer data: totalSpend=$${customer.totalSpend}, visits=${customer.visits}, lastActive=${customer.lastActive}.`;

        const aiResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a marketing assistant that segments customers based on their data.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 20,
            temperature: 0.5,
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const segment = aiResponse.data.choices[0].message.content.trim();
        return { ...customer, segment };
      })
    );

    console.log('Customers segmented with AI');
    res.status(200).json({ message: 'Customers segmented successfully', customers: segmentedCustomers });
  } catch (error) {
    console.error('Error segmenting customers with Open AI:', error.message);
    res.status(500).json({ error: 'Failed to segment customers with AI' });
  }
};