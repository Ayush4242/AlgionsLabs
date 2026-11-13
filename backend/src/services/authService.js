const User = require('../models/User');
const generateToken = require('../utils/generateToken');

class AuthService {
  async register({ name, email, password, role = 'customer', phone }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User already exists with this email address');
      error.statusCode = 400;
      throw error;
    }

    // Customer can only register as customer by default.
    // If admin creation is requested via seeding or admin dashboard, allowed.
    const userRole = ['admin', 'manager'].includes(role) ? role : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone: phone || '',
    });

    const token = generateToken(user._id, user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedHotel: user.assignedHotel,
        phone: user.phone,
        avatar: user.avatar,
      },
      token,
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email }).select('+password').populate('assignedHotel', 'name city');
    if (!user) {
      const error = new Error('Invalid email or password credentials');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user._id, user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedHotel: user.assignedHotel,
        phone: user.phone,
        avatar: user.avatar,
      },
      token,
    };
  }

  async getMe(userId) {
    const user = await User.findById(userId).populate('assignedHotel', 'name city address featuredImage');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const allowedUpdates = ['name', 'phone', 'avatar'];
    const filteredData = {};

    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // If password update requested
    if (updateData.currentPassword && updateData.newPassword) {
      const user = await User.findById(userId).select('+password');
      const isMatch = await user.comparePassword(updateData.currentPassword);
      if (!isMatch) {
        const error = new Error('Current password does not match');
        error.statusCode = 400;
        throw error;
      }
      user.password = updateData.newPassword;
      await user.save();
    }

    const updatedUser = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    }).populate('assignedHotel', 'name city');

    return updatedUser;
  }
}

module.exports = new AuthService();
