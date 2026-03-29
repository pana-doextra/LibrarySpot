// routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const Seat = require('../model/seats');
const User = require('../model/users');

router.get('/', async (req, res) => {
  try {
    const { floor } = req.query;
    let query = {};
    if (floor) {
      query.floor = parseInt(floor);
    }
    const seats = await Seat.find(query);
    res.json(seats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reserve', async (req, res) => {
  const { seatId, student } = req.body;
  console.log(`Reservation request: seatId=${seatId}, student=${student}`);

  try {
    const seat = await Seat.findOne({ id: seatId });

    if (!seat) {
      console.log(`Seat ${seatId} not found`);
      return res.status(404).json({ message: 'Seat not found' });
    }

    if (seat.status === 'taken') {
      console.log(`Seat ${seatId} already taken by ${seat.occupant}`);
      return res.status(400).json({ message: 'Seat taken' });
    }

    // free old seat if exists
    await Seat.updateMany(
      { occupant: student },
      { status: 'free', occupant: null }
    );

    // update seat
    seat.status = 'taken';
    seat.occupant = student;
    await seat.save();

    // update or create user
    await User.findOneAndUpdate(
      { name: student },
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

router.post('/leave', async (req, res) => {
  const { student } = req.body;

  try {
    const seat = await Seat.findOne({ occupant: student });

    if (seat) {
      seat.status = 'free';
      seat.occupant = null;
      await seat.save();
    }

    await User.findOneAndUpdate(
      { name: student },
      { seatId: null }
    );

    res.json({ message: 'Left seat successfully' });
  } catch (err) {
    console.error('Leave error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const auth = require('../config/auth');

// Add auth middleware to protected routes
router.post('/reserve', auth, async (req, res) => {
  // your existing code — but now req.student has the logged in student ID
  const student = req.student; // ✅ comes from token, not req.body
  const { seatId } = req.body;
  // ... rest of your code
});

router.post('/leave', auth, async (req, res) => {
  const student = req.student; // ✅ comes from token
  // ... rest of your code
});


module.exports = router;