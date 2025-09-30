const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/bookings', bookingController.createBooking);
router.delete('/bookings/:bookingId', bookingController.cancelBooking);
router.get('/bookings', bookingController.getBookings);
router.get('/bookingsByDate', bookingController.getBookingsByDate);

module.exports = router;
