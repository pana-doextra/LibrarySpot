const express = require('express');
const router = express.Router();
const Seat = require('../model/seats');
const User = require('../model/users');
const auth = require('../config/auth');

// GET all seats (public)
router.get('/', async (req, res) => {
  try {
    const { floor } = req.query;
    let query = {};
    if (floor) query.floor = parseInt(floor);
    const seats = await Seat.find(query);
    res.json(seats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RESERVE a seat (protected)
router.post('/reserve', auth, async (req, res) => {
  const { seatId } = req.body;
  const student = req.student;
  console.log(`Reservation request: seatId=${seatId}, student=${student}`);

  try {
    const seat = await Seat.findOne({ id: seatId });
    if (!seat) return res.status(404).json({ message: 'Seat not found' });
    if (seat.status === 'taken') return res.status(400).json({ message: 'Seat already taken' });

    // Free old seat if exists
    await Seat.updateMany({ occupant: student }, { status: 'free', occupant: null });

    // Take new seat
    seat.status = 'taken';
    seat.occupant = student;
    await seat.save();

    // Update user
    await User.findOneAndUpdate(
      { studentId: student },
      { seatId: seatId },
      { upsert: true, new: true }
    );

    console.log(`Seat ${seatId} reserved for ${student}`);
    res.json(seat);
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LEAVE a seat (protected)
router.post('/leave', auth, async (req, res) => {
  const student = req.student;

  try {
    const seat = await Seat.findOne({ occupant: student });
    if (seat) {
      seat.status = 'free';
      seat.occupant = null;
      await seat.save();
    }

    await User.findOneAndUpdate(
      { studentId: student },
      { seatId: null }
    );

    res.json({ message: 'Left seat successfully' });
  } catch (err) {
    console.error('Leave error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;