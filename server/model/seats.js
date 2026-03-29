const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  floor: { type: Number, required: true, min: 1, max: 5 },
  status: { type: String, default: 'free' },
  occupant: { type: String, default: null }
});

module.exports = mongoose.model('Seat', seatSchema);