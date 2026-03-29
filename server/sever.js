const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/seats', require('./routes/seatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(express.static(path.join(__dirname, '../public')));

// catch-all fallback for SPA routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

// Initialize seats in database
const initializeSeats = async () => {
  const Seat = require('./model/seats');

  try {
    let created = 0;
    // Create seats for 5 floors
    for (let floor = 1; floor <= 5; floor++) {
      const seatDefs = [
        // Window seats
        'W01', 'W02', 'W03', 'W04', 'W05',
        // Quiet zone 1
        'Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06',
        // Quiet zone 2
        'Q07', 'Q08', 'Q09', 'Q10', 'Q11', 'Q12',
        // Collab zone 1
        'C01', 'C02', 'C03', 'C04', 'C05', 'C06',
        // Collab zone 2
        'C07', 'C08', 'C09', 'C10', 'C11', 'C12'
      ];

      for (const seatId of seatDefs) {
        const fullSeatId = `F${floor}-${seatId}`;
        const existing = await Seat.findOne({ id: fullSeatId });
        if (!existing) {
          await Seat.create({
            id: fullSeatId,
            floor: floor,
            status: 'free',
            occupant: null
          });
          created++;
        }
      }
    }
    console.log(`Seats initialized: ${created} new seats created across 5 floors`);
  } catch (err) {
    console.error('Error initializing seats:', err);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await initializeSeats();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();