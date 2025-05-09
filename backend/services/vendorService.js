const axios = require('axios');
const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');
const { logger } = require('../utils/logger');

exports.sendCampaign = async (campaign, audience) => {
  for (const customer of audience) {
    try {
      // Simulate 90% success, 10% failure
      const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
      const log = new CommunicationLog({
        campaignId: campaign._id,
        customerId: customer._id,
        status,
      });
      await log.save();
      // Update campaign with log ID
      await Campaign.updateOne(
        { _id: campaign._id },
        { $push: { communicationLogs: log._id } }
      );
      await axios.post('http://localhost:5000/api/delivery/receipt', {
        campaignId: campaign._id,
        customerId: customer._id,
        status,
      });
      logger.info(`Message sent to ${customer.email}: ${status}`);
    } catch (error) {
      logger.error(`Error sending message to ${customer.email}:`, error.message);
    }
  }
};