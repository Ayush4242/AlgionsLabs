const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.get('/:id/availability', checkAvailability);

router.post('/', protect, authorize('admin', 'manager'), createRoom);
router.put('/:id', protect, authorize('admin', 'manager'), updateRoom);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteRoom);

module.exports = router;
