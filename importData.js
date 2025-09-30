require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/userModel');
const Room = require('./models/roomModel');
const connectDB = require('./config/database');

const run = async () => {
  try {
    await connectDB();

    const filePath = path.join(__dirname, 'hotel.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    await User.deleteMany({});
    await Room.deleteMany({});

    if (data.users && data.users.length > 0) {
      await User.insertMany(data.users);
      console.log(`Imported ${data.users.length} users`);
    }

    if (data.rooms && data.rooms.length > 0) {
      await Room.insertMany(data.rooms);
      console.log(`Imported ${data.rooms.length} rooms`);
    }

    console.log('Import done!');
    process.exit();
  } catch (err) {
    console.error('Error importing data:', err.message);
    process.exit(1);
  }
};

run();
