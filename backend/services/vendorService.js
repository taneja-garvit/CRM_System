const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');
const { logger } = require('../utils/logger');

exports.sendCampaign = async (campaign, audience) => {
  const logs = [];
  for (const customer of audience) {
    try {
      // Simulate 90% success, 10% failure
      const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
      const error = status === 'FAILED' ? 'Invalid email address' : undefined;

      const log = new CommunicationLog({
        campaignId: campaign._id,
        customerId: customer._id,
        customerEmail: customer.email,
        message: campaign.message,
        status,
        error,
      });

      await log.save();
      logs.push(log._id);

      logger.info(`Communication log created for ${customer.email}: ${status}`);
    } catch (error) {
      logger.error(`Error creating communication log for ${customer.email}: ${error.message}`);
    }
  }

  try {
    // Update campaign with log IDs
    await Campaign.updateOne(
      { _id: campaign._id },
      { $push: { communicationLogs: { $each: logs } } }
    );
    logger.info(`Campaign ${campaign._id} updated with ${logs.length} communication logs`);
  } catch (error) {
    logger.error(`Error updating campaign ${campaign._id} with logs: ${error.message}`);
  }
};