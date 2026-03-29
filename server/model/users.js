const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  seatId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);