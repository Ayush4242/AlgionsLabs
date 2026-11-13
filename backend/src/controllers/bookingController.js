const bookingService = require('../services/bookingService');

// @desc    Create a new booking reservation
// @route   POST /api/bookings
// @access  Private (Customer, Admin)
const createBooking = async (req, res, next) => {
  try {
    const {
      hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      guestDetails,
      paymentMethod,
    } = req.body;

    if (!hotelId || !roomId || !checkInDate || !checkOutDate || !guestDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required booking details',
      });
    }

    const booking = await bookingService.createBooking({
      userId: req.user._id,
      hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      guestDetails,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created and confirmed successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current customer's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user._id);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin all, Manager assigned hotel)
// @route   GET /api/bookings
// @access  Private (Admin, Manager)
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings(req.query, req.user);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Admin, Manager, or Booking Owner)
const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (confirmed, cancelled, completed, pending)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin, Manager)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const updated = await bookingService.updateBookingStatus(
      req.params.id,
      status,
      req.user
    );

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer cancel their own booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer)
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const cancelled = await bookingService.cancelBookingByCustomer(
      req.params.id,
      req.user._id,
      reason
    );

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};
