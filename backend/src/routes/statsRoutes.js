const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getManagerStats,
  getAllUsers,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/manager', protect, authorize('manager'), getManagerStats);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
