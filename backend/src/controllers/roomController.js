const roomService = require('../services/roomService');
const Hotel = require('../models/Hotel');

// @desc    Get all rooms with filter
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getRooms(req.query);
    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check room availability for date range
// @route   GET /api/rooms/:id/availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate } = req.query;
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both checkInDate and checkOutDate',
      });
    }

    const result = await roomService.checkAvailability(
      req.params.id,
      checkInDate,
      checkOutDate
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (Admin or assigned Manager)
const createRoom = async (req, res, next) => {
  try {
    const { hotel } = req.body;
    if (!hotel) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID is required to create a room',
      });
    }

    if (req.user.role === 'manager') {
      if (
        !req.user.assignedHotel ||
        req.user.assignedHotel.toString() !== hotel.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only create rooms for your assigned hotel.',
        });
      }
    }

    const room = await roomService.createRoom(req.body);
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin or assigned Manager)
const updateRoom = async (req, res, next) => {
  try {
    const existingRoom = await roomService.getRoomById(req.params.id);
    if (req.user.role === 'manager') {
      if (
        !req.user.assignedHotel ||
        req.user.assignedHotel.toString() !== existingRoom.hotel._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only update rooms in your assigned hotel.',
        });
      }
    }

    const updatedRoom = await roomService.updateRoom(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin or assigned Manager)
const deleteRoom = async (req, res, next) => {
  try {
    const existingRoom = await roomService.getRoomById(req.params.id);
    if (req.user.role === 'manager') {
      if (
        !req.user.assignedHotel ||
        req.user.assignedHotel.toString() !== existingRoom.hotel._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete rooms in your assigned hotel.',
        });
      }
    }

    const result = await roomService.deleteRoom(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
};
