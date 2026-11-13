const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/', protect, authorize('admin', 'manager'), getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
