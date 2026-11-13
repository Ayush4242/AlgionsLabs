const express = require('express');
const router = express.Router();
const {
  getHotels,
  getFeaturedHotels,
  getPopularDestinations,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/destinations', getPopularDestinations);
router.get('/:id', getHotelById);

// Admin & Manager routes
router.post('/', protect, authorize('admin'), createHotel);
router.put('/:id', protect, authorize('admin', 'manager'), updateHotel);
router.delete('/:id', protect, authorize('admin'), deleteHotel);

module.exports = router;
