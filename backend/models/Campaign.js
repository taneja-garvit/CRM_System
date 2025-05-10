import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  segmentRules: { type: Object, required: true },
  message: { type: String, required: true },
  audienceSize: { type: Number, required: true },
  communicationLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunicationLog' }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Campaign', campaignSchema);
