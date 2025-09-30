require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/database');
const bookingRoutes = require('./routes/bookingRoutes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', bookingRoutes);

app.get('/', (req, res) => res.send('Hotel Booking API running...'));

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
