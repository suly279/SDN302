const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel');
const User = require('../models/userModel');

exports.createBooking = async (req, res) => {
  try {
    const { customerId, roomId, checkInDate, checkOutDate } = req.body;

    if (!customerId || !roomId || !checkInDate || !checkOutDate) 
      return res.status(400).json({ message: 'Missing fields' });

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    if (isNaN(inDate) || isNaN(outDate)) return res.status(400).json({ message: 'Invalid dates' });
    if (inDate >= outDate) return res.status(400).json({ message: 'checkInDate must be before checkOutDate' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const overlapping = await Booking.findOne({
      roomId,
      status: { $ne: 'cancelled' },
      checkInDate: { $lt: outDate },
      checkOutDate: { $gt: inDate }
    });

    if (overlapping) return res.status(400).json({ message: 'Room not available in requested period' });

    const booking = new Booking({
      customerId, roomId, checkInDate: inDate, checkOutDate: outDate, status: 'pending'
    });
    await booking.save();

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const now = new Date();
    if (now >= booking.checkInDate) return res.status(400).json({ message: 'Cannot cancel booking on/after check-in date' });

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '10'));
    const skip = (page - 1) * limit;

    const total = await Booking.countDocuments({});
    if (total === 0) {
      return res.json({ message: 'No bookings found', total: 0, bookings: [] });
    }

    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'name email')
      .populate('roomId', 'name roomNumber price');

    res.json({ total, page, limit, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate required' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: 'Invalid dates' });
    if (start >= end) return res.status(400).json({ message: 'startDate must be before endDate' });

    const bookings = await Booking.find({
      status: { $ne: 'cancelled' },
      checkInDate: { $lt: end },
      checkOutDate: { $gt: start }
    }).populate('customerId', 'name email')
      .populate('roomId', 'name roomNumber');

    if (!bookings || bookings.length === 0) return res.json({ message: 'No bookings in this date range', bookings: [] });

    res.json({ total: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
