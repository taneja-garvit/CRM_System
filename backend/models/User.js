import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  mobile: { type: String }, // Removed unique: true
}, { timestamps: true });

export default mongoose.model('User', userSchema);
