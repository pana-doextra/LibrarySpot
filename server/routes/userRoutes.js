const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/users');

// REGISTER
router.post('/register', async (req, res) => {
  const { studentId, password } = req.body;
  try {
    const existing = await User.findOne({ studentId });
    if (existing) return res.status(400).json({ message: 'Student ID already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ studentId, password: hashed });

    const token = jwt.sign({ studentId: user.studentId }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, studentId: user.studentId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { studentId, password } = req.body;
  try {
    const user = await User.findOne({ studentId });
    if (!user) return res.status(400).json({ message: 'Student ID not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ studentId: user.studentId }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, studentId: user.studentId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;