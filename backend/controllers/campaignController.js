const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const { sendCampaign } = require('../services/vendorService');
const { logger } = require('../utils/logger');

exports.createCampaign = async (req, res) => {
  try {
    const { segmentRules, message } = req.body;
    if (!mongoose.isValidObjectId(req.user.id)) {
      throw new Error('Invalid user ID');
    }
    console.log('Creating campaign for user ID:', req.user.id); // Debug log
    const audience = await Customer.find(segmentRules);
    const campaign = new Campaign({
      userId: new mongoose.Types.ObjectId(req.user.id),
      segmentRules,
      message,
      audienceSize: audience.length,
      communicationLogs: [],
    });
    await campaign.save();
    logger.info(`Campaign ${campaign._id} created for user ${req.user.id}`);
    await sendCampaign(campaign, audience);
    res.status(201).json(campaign);
  } catch (error) {
    logger.error(`Error creating campaign for user ${req.user?.id || 'unknown'}: ${error.message}`);
    res.status(500).json({ error: 'Failed to create campaign', details: error.message });
  }
};

exports.getCampaignHistory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.user.id)) {
      throw new Error('Invalid user ID');
    }
    console.log('Fetching campaigns for user ID:', req.user.id); // Debug log
    const campaigns = await Campaign.find({ userId: new mongoose.Types.ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .populate('communicationLogs');
    console.log('Campaigns found:', campaigns); // Debug log
    const campaignsWithStats = await Promise.all(campaigns.map(async (campaign) => {
      const logs = await CommunicationLog.find({ campaignId: campaign._id });
      const sent = logs.filter(log => log.status === 'SENT').length;
      const failed = logs.filter(log => log.status === 'FAILED').length;
      return {
        ...campaign.toObject(),
        deliveryStats: { sent, failed },
      };
    }));
    res.json(campaignsWithStats);
  } catch (error) {
    logger.error(`Error fetching campaign history for user ${req.user?.id || 'unknown'}: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch campaign history', details: error.message });
  }
};