const CommunicationLog = require('../models/CommunicationLog');
const { logger } = require('../utils/logger');

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { campaignId, customerId, status } = req.body;
    const log = new CommunicationLog({ campaignId, customerId, status });
    await log.save();
    logger.info(`Delivery status updated for campaign ${campaignId}`);
    res.status(200).json({ message: 'Delivery status updated' });
  } catch (error) {
    logger.error('Error updating delivery status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};