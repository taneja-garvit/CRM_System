const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerEmail: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['SENT', 'FAILED', 'PENDING'], required: true },
  createdAt: { type: Date, default: Date.now },
  error: { type: String },
});

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);