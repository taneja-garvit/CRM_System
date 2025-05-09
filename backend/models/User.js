const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  mobile: { type: String }, // Removed unique: true
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);