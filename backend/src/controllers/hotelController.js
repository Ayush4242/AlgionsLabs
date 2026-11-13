const hotelService = require('../services/hotelService');

// @desc    Get all hotels with filtering, sorting, pagination
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res, next) => {
  try {
    const result = await hotelService.getAllHotels(req.query);
    res.status(200).json({
      success: true,
      data: result.hotels,
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured hotels
// @route   GET /api/hotels/featured
// @access  Public
const getFeaturedHotels = async (req, res, next) => {
  try {
    const limit = req.query.limit || 6;
    const hotels = await hotelService.getFeaturedHotels(limit);
    res.status(200).json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular destinations
// @route   GET /api/hotels/destinations
// @access  Public
const getPopularDestinations = async (req, res, next) => {
  try {
    const destinations = await hotelService.getPopularDestinations();
    res.status(200).json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hotel by ID with rooms
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res, next) => {
  try {
    const data = await hotelService.getHotelById(req.params.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create hotel
// @route   POST /api/hotels
// @access  Private (Admin only)
const createHotel = async (req, res, next) => {
  try {
    const hotel = await hotelService.createHotel(req.body);
    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Admin or assigned Manager)
const updateHotel = async (req, res, next) => {
  try {
    // If manager, verify assignment
    if (req.user.role === 'manager') {
      if (
        !req.user.assignedHotel ||
        req.user.assignedHotel.toString() !== req.params.id
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your assigned hotel.',
        });
      }
    }

    const updatedHotel = await hotelService.updateHotel(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: updatedHotel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Admin only)
const deleteHotel = async (req, res, next) => {
  try {
    const result = await hotelService.deleteHotel(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotels,
  getFeaturedHotels,
  getPopularDestinations,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};
