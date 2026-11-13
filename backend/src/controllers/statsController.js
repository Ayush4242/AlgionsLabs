const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/stats/admin
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalHotels,
      totalRooms,
      totalCustomers,
      totalBookings,
      revenueResult,
      statusCounts,
      recentBookings,
    ] = await Promise.all([
      Hotel.countDocuments(),
      Room.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { bookingStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
      ]),
      Booking.aggregate([
        { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
      ]),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('hotel', 'name city')
        .populate('room', 'roomNumber roomType')
        .populate('user', 'name email'),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          bookingStatus: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Room availability overview
    const [availableRooms, bookedRooms, maintenanceRooms] = await Promise.all([
      Room.countDocuments({ status: 'available', isAvailable: true }),
      Room.countDocuments({ status: 'booked' }),
      Room.countDocuments({ status: 'maintenance' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalHotels,
        totalRooms,
        totalCustomers,
        totalBookings,
        totalRevenue,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentBookings,
        monthlyRevenue,
        roomAvailability: {
          available: availableRooms,
          booked: bookedRooms,
          maintenance: maintenanceRooms,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Manager Dashboard Stats
// @route   GET /api/stats/manager
// @access  Private (Manager)
const getManagerStats = async (req, res, next) => {
  try {
    const hotelId = req.user.assignedHotel;
    if (!hotelId) {
      return res.status(200).json({
        success: true,
        data: {
          hotel: null,
          totalRooms: 0,
          totalBookings: 0,
          totalRevenue: 0,
          recentBookings: [],
          roomAvailability: { available: 0, booked: 0, maintenance: 0 },
        },
      });
    }

    const hotel = await Hotel.findById(hotelId);
    const [
      totalRooms,
      totalBookings,
      revenueResult,
      recentBookings,
      availableRooms,
      bookedRooms,
      maintenanceRooms,
    ] = await Promise.all([
      Room.countDocuments({ hotel: hotelId }),
      Booking.countDocuments({ hotel: hotelId }),
      Booking.aggregate([
        { $match: { hotel: hotelId, bookingStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
      ]),
      Booking.find({ hotel: hotelId })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('room', 'roomNumber roomType')
        .populate('user', 'name email'),
      Room.countDocuments({ hotel: hotelId, status: 'available', isAvailable: true }),
      Room.countDocuments({ hotel: hotelId, status: 'booked' }),
      Room.countDocuments({ hotel: hotelId, status: 'maintenance' }),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        hotel,
        totalRooms,
        totalBookings,
        totalRevenue,
        recentBookings,
        roomAvailability: {
          available: availableRooms,
          booked: bookedRooms,
          maintenance: maintenanceRooms,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (Admin only)
// @route   GET /api/stats/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('assignedHotel', 'name city');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getManagerStats,
  getAllUsers,
};
