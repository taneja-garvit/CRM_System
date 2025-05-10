import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  totalSpend: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
