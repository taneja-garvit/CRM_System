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


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const segmentCustomers = async (req, res) => {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('Missing PERPLEXITY_API_KEY');
      return res.status(500).json({ error: 'Server misconfiguration: missing PERPLEXITY_API_KEY' });
    }

    const customers = await Customer.find().lean();
    if (!customers || customers.length === 0) {
      return res.status(200).json({ message: 'No customers found', customers: [] });
    }

    const segmentedCustomers = [];
    const concurrency = 3; // safe default, raise carefully
    const chunkDelayMs = 200; // small pause between chunks
    const models = ['sonar-pro', 'sonar']; // try sonar if sonar-pro isn't available
    const axiosTimeout = 30000; // 30s

    for (let i = 0; i < customers.length; i += concurrency) {
      const chunk = customers.slice(i, i + concurrency);

      const chunkResults = await Promise.all(
        chunk.map(async (customer) => {
          try {
            const prompt = `Analyze customer data and suggest a segment (e.g., High Spender, Frequent Visitor, Inactive User). Customer data: totalSpend=$${customer.totalSpend}, visits=${customer.visits}, lastActive=${customer.lastActive}.`;

            let aiResponse = null;
            let lastError = null;

            // Try fallback models if first one is not available
            for (const model of models) {
              try {
                aiResponse = await axios.post(
                  'https://api.perplexity.ai/chat/completions',
                  {
                    model,
                    messages: [
                      {
                        role: 'system',
                        content: 'You are a marketing assistant that segments customers based on their data.'
                      },
                      { role: 'user', content: prompt }
                    ],
                    max_tokens: 20,
                    temperature: 0.5
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                      'Content-Type': 'application/json',
                      Accept: 'application/json'
                    },
                    timeout: axiosTimeout
                  }
                );

                // success -> break out of model loop
                break;
              } catch (e) {
                lastError = e;
                // if 401/403 for a model, try the next model; otherwise keep lastError to inspect
                if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                  console.warn(`Model ${model} rejected (status ${e.response.status}), trying next model if available.`);
                  continue;
                } else {
                  // for network/500/429/etc, log and break so we don't immediately retry different model
                  console.warn(`Error calling Perplexity with model ${model}:`, e.response?.data ?? e.message);
                  // allow trying next model in case it's a model availability issue
                  continue;
                }
              }
            } // end model loop

            if (!aiResponse) {
              console.error('No successful response from Perplexity for customer id', customer._id, 'lastError:', lastError?.message ?? lastError);
              return { ...customer, segment: 'Uncategorized', aiError: lastError?.message ?? 'No response' };
            }

            // Debug: log a compact snapshot of the AI response for this customer
            console.log(`Perplexity response (customer ${customer._id}): status=${aiResponse.status}`);

            // Robust extraction of returned text
            let segment =
              aiResponse.data?.choices?.[0]?.message?.content ??
              aiResponse.data?.choices?.[0]?.message ??
              aiResponse.data?.choices?.[0]?.text ??
              aiResponse.data?.answer ??
              aiResponse.data?.output_text ??
              '';

            if (typeof segment === 'object') segment = JSON.stringify(segment);
            segment = (segment || '').toString().trim();

            if (!segment) {
              // Log the full response data truncated to help debugging
              console.warn('Empty segment from Perplexity for customer', customer._id, 'response snapshot:', JSON.stringify(aiResponse.data).slice(0, 2000));
              segment = 'Uncategorized';
            }

            // keep it short (original requirement)
            segment = segment.split('.')[0].substring(0, 40);

            return { ...customer, segment };
          } catch (err) {
            // Per-customer error — don't crash the whole batch
            if (axios.isAxiosError(err)) {
              console.error('AI error for customer', customer._id, {
                message: err.message,
                status: err.response?.status,
                responseData: err.response?.data
              });
            } else {
              console.error('Unexpected error for customer', customer._id, err);
            }
            return { ...customer, segment: 'Uncategorized', aiError: err.message || 'error' };
          }
        })
      ); // end Promise.all for chunk

      segmentedCustomers.push(...chunkResults);

      // small pause between chunks to be gentle with the API
      if (i + concurrency < customers.length) {
        await sleep(chunkDelayMs);
      }
    } // end chunk loop

    console.log('Customers segmented with AI, total:', segmentedCustomers.length);
    res.status(200).json({ message: 'Customers segmented successfully', customers: segmentedCustomers });
  } catch (error) {
    // Better server-side logging for the outer error
    if (axios.isAxiosError(error)) {
      console.error('Axios error in segmentCustomers:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return res.status(500).json({ error: 'Failed to segment customers with AI', details: error.response?.data ?? error.message });
    } else {
      console.error('Error in segmentCustomers:', error);
      return res.status(500).json({ error: 'Failed to segment customers with AI', details: error.message });
    }
  }
};