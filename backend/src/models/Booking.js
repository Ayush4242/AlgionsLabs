const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Booking must specify a hotel'],
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Booking must specify a room'],
      index: true,
    },
    checkInDate: {
      type: Date,
      required: [true, 'Please provide check-in date'],
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please provide check-out date'],
      index: true,
    },
    totalNights: {
      type: Number,
      required: true,
      min: [1, 'Must book for at least one night'],
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    taxesAndFees: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    guests: {
      adults: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    guestDetails: {
      fullName: {
        type: String,
        required: [true, 'Guest full name is required'],
      },
      email: {
        type: String,
        required: [true, 'Guest email is required'],
      },
      phone: {
        type: String,
        required: [true, 'Guest phone is required'],
      },
      specialRequests: {
        type: String,
        default: '',
      },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'crypto'],
      default: 'credit_card',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index to quickly check overlapping bookings
bookingSchema.index({ room: 1, bookingStatus: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
