const Room = require('../models/Room');
const Booking = require('../models/Booking');

class RoomService {
  async getRooms(query) {
    const filter = {};
    if (query.hotel) filter.hotel = query.hotel;
    if (query.roomType) filter.roomType = query.roomType;
    if (query.status) filter.status = query.status;
    if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable === 'true';

    return await Room.find(filter).populate('hotel', 'name city country');
  }

  async getRoomById(id) {
    const room = await Room.findById(id).populate('hotel');
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }
    return room;
  }

  async checkAvailability(roomId, checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      const error = new Error('Invalid check-in or check-out date');
      error.statusCode = 400;
      throw error;
    }

    if (checkOut <= checkIn) {
      const error = new Error('Check-out date must be strictly after check-in date');
      error.statusCode = 400;
      throw error;
    }

    const room = await Room.findById(roomId);
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room.isAvailable || room.status !== 'available') {
      return {
        available: false,
        reason: 'Room is currently undergoing maintenance or unavailable',
      };
    }

    // Check overlapping bookings: (ExistingCheckIn < NewCheckOut) AND (ExistingCheckOut > NewCheckIn)
    const overlappingBooking = await Booking.findOne({
      room: roomId,
      bookingStatus: { $in: ['pending', 'confirmed'] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    return {
      available: !overlappingBooking,
      room,
      overlappingBookingId: overlappingBooking ? overlappingBooking._id : null,
    };
  }

  async createRoom(roomData) {
    const room = await Room.create(roomData);
    return room;
  }

  async updateRoom(id, updateData) {
    const room = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }
    return room;
  }

  async deleteRoom(id) {
    const room = await Room.findByIdAndDelete(id);
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Room deleted successfully' };
  }
}

module.exports = new RoomService();
