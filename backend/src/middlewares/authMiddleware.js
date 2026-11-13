const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - JWT verification
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token missing.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hotel_secret_fallback_key'
    );
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed or expired.',
      error: error.message,
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

// Ensure manager only manages their assigned hotel
const checkManagerHotelAccess = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next(); // Admins have full access to all hotels
  }

  if (req.user.role === 'manager') {
    const hotelId = req.params.hotelId || req.body.hotel || req.query.hotelId;
    if (
      !req.user.assignedHotel ||
      (hotelId && req.user.assignedHotel.toString() !== hotelId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only manage your assigned hotel.',
      });
    }
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied.',
  });
};

module.exports = {
  protect,
  authorize,
  checkManagerHotelAccess,
};
