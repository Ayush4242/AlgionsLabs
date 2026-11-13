const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

class BookingService {
  // Generate random unique booking reference like BK-72941
  generateBookingReference() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'BK-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createBooking({
    userId,
    hotelId,
    roomId,
    checkInDate,
    checkOutDate,
    guests,
    guestDetails,
    paymentMethod = 'credit_card',
  }) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Rule: Valid date check
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      const error = new Error('Invalid check-in or check-out date format');
      error.statusCode = 400;
      throw error;
    }

    // Rule: Check-out must be later than check-in
    if (checkOut <= checkIn) {
      const error = new Error('Check-out date must be strictly after check-in date');
      error.statusCode = 400;
      throw error;
    }

    // Ensure check-in date is not in the past (allow same day check-in)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInCompare = new Date(checkIn);
    checkInCompare.setHours(0, 0, 0, 0);

    if (checkInCompare < today) {
      const error = new Error('Check-in date cannot be in the past');
      error.statusCode = 400;
      throw error;
    }

    // Calculate total nights
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalNights < 1) {
      const error = new Error('Booking must be for at least 1 night');
      error.statusCode = 400;
      throw error;
    }

    // Fetch and validate Room
    const room = await Room.findById(roomId).populate('hotel');
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room.isAvailable || room.status !== 'available') {
      const error = new Error('Room is currently unavailable for booking');
      error.statusCode = 400;
      throw error;
    }

    // Ensure room belongs to the requested hotel
    if (room.hotel._id.toString() !== hotelId.toString()) {
      const error = new Error('Room does not belong to the selected hotel');
      error.statusCode = 400;
      throw error;
    }

    // Check capacity
    const totalGuests = Number(guests?.adults || 1) + Number(guests?.children || 0);
    if (totalGuests > (room.capacity?.totalGuests || 4)) {
      const error = new Error(`Room maximum capacity is ${room.capacity?.totalGuests || 4} guests`);
      error.statusCode = 400;
      throw error;
    }

    // CRITICAL: Double-booking prevention - check overlapping active bookings
    const overlapping = await Booking.findOne({
      room: roomId,
      bookingStatus: { $in: ['pending', 'confirmed'] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (overlapping) {
      const error = new Error(
        'This room is already booked for the selected dates. Please select different dates or another room.'
      );
      error.statusCode = 409;
      throw error;
    }

    // Calculate price STRICTLY on the backend to prevent frontend tampering
    const pricePerNight = room.pricePerNight;
    const subtotal = pricePerNight * totalNights;
    const taxesAndFees = Math.round(subtotal * 0.12); // 12% luxury tax & service
    const totalPrice = subtotal + taxesAndFees;

    // Generate unique reference
    let bookingReference = this.generateBookingReference();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Booking.findOne({ bookingReference });
      if (!existing) isUnique = true;
      else bookingReference = this.generateBookingReference();
    }

    const booking = await Booking.create({
      bookingReference,
      user: userId,
      hotel: hotelId,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights,
      pricePerNight,
      taxesAndFees,
      totalPrice,
      guests: {
        adults: Number(guests?.adults || 1),
        children: Number(guests?.children || 0),
      },
      guestDetails: {
        fullName: guestDetails.fullName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        specialRequests: guestDetails.specialRequests || '',
      },
      paymentStatus: 'paid',
      paymentMethod,
      bookingStatus: 'confirmed',
    });

    return await Booking.findById(booking._id)
      .populate('hotel', 'name address city country featuredImage starRating')
      .populate('room', 'roomNumber roomType title images pricePerNight bedType')
      .populate('user', 'name email phone');
  }

  async getCustomerBookings(userId) {
    return await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('hotel', 'name address city country featuredImage starRating')
      .populate('room', 'roomNumber roomType title images pricePerNight bedType');
  }

  async getAllBookings(query, user) {
    const filter = {};

    // Role-based scoping: Manager only sees bookings for their assigned hotel
    if (user.role === 'manager') {
      if (!user.assignedHotel) {
        return [];
      }
      filter.hotel = user.assignedHotel;
    } else if (query.hotel) {
      filter.hotel = query.hotel;
    }

    if (query.status && query.status !== 'all') {
      filter.bookingStatus = query.status;
    }

    if (query.reference) {
      filter.bookingReference = { $regex: query.reference, $options: 'i' };
    }

    return await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('hotel', 'name city country')
      .populate('room', 'roomNumber roomType title pricePerNight')
      .populate('user', 'name email phone');
  }

  async getBookingById(bookingId, user) {
    const booking = await Booking.findById(bookingId)
      .populate('hotel')
      .populate('room')
      .populate('user', 'name email phone avatar');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Role access control:
    // Customer can only see their own booking
    if (user.role === 'customer' && booking.user._id.toString() !== user._id.toString()) {
      const error = new Error('Access denied to this booking');
      error.statusCode = 403;
      throw error;
    }

    // Manager can only see bookings for their assigned hotel
    if (
      user.role === 'manager' &&
      (!user.assignedHotel || booking.hotel._id.toString() !== user.assignedHotel.toString())
    ) {
      const error = new Error('Access denied to bookings outside your assigned hotel');
      error.statusCode = 403;
      throw error;
    }

    return booking;
  }

  async updateBookingStatus(bookingId, status, user) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'manager') {
      if (!user.assignedHotel || booking.hotel.toString() !== user.assignedHotel.toString()) {
        const error = new Error('Access denied. You cannot modify bookings of other hotels');
        error.statusCode = 403;
        throw error;
      }
    }

    booking.bookingStatus = status;
    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.paymentStatus = 'refunded';
    }

    await booking.save();
    return booking;
  }

  async cancelBookingByCustomer(bookingId, userId, reason = 'Cancelled by customer') {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Must be owner
    if (booking.user.toString() !== userId.toString()) {
      const error = new Error('Not authorized to cancel this booking');
      error.statusCode = 403;
      throw error;
    }

    if (booking.bookingStatus === 'cancelled') {
      const error = new Error('Booking is already cancelled');
      error.statusCode = 400;
      throw error;
    }

    // Eligible check: checkInDate must be today or in the future
    const now = new Date();
    if (new Date(booking.checkInDate) < now) {
      const error = new Error('Cannot cancel a reservation that has already started or completed');
      error.statusCode = 400;
      throw error;
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.paymentStatus = 'refunded';

    await booking.save();
    return booking;
  }
}

module.exports = new BookingService();
