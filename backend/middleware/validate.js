const Joi = require('joi');

const customerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  totalSpend: Joi.number().default(0),
  visits: Joi.number().default(0),
  lastActive: Joi.date().default(Date.now),
});

const orderSchema = Joi.object({
  customerId: Joi.string().required(),
  amount: Joi.number().required(),
  date: Joi.date().default(Date.now),
});

const campaignSchema = Joi.object({
  segmentRules: Joi.object().required(),
  message: Joi.string().required(),
});

exports.validateCustomer = (req, res, next) => {
  const { error } = customerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

exports.validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

exports.validateCampaign = (req, res, next) => {
  const { error } = campaignSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};