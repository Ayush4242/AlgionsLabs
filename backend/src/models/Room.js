const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Room must belong to a hotel'],
      index: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number or unit name'],
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, 'Please provide room type'],
      enum: ['Standard Room', 'Deluxe Suite', 'Executive Suite', 'Presidential Villa', 'Penthouse'],
      default: 'Deluxe Suite',
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the room'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide room description'],
      maxlength: [1500, 'Room description cannot exceed 1500 characters'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide price per night'],
      min: [0, 'Price must be positive'],
    },
    capacity: {
      adults: {
        type: Number,
        required: true,
        default: 2,
        min: 1,
      },
      children: {
        type: Number,
        default: 1,
        min: 0,
      },
      totalGuests: {
        type: Number,
        default: 3,
        min: 1,
      },
    },
    bedType: {
      type: String,
      enum: ['King Bed', 'Queen Bed', 'Double Beds', 'Twin Beds', 'California King'],
      default: 'King Bed',
    },
    sizeInSqFt: {
      type: Number,
      default: 450,
    },
    amenities: {
      type: [String],
      default: [
        'Private Balcony with Sunset View',
        'High-Speed Wi-Fi',
        'Smart Flat TV 65"',
        'Mini Bar & Nespresso Station',
        'En-suite Marble Jacuzzi Bath',
        'Air Conditioning & Climate Control',
        'Plush Bathrobes & Slippers',
        '24h In-Room Dining',
      ],
    },
    images: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure roomNumber is unique per hotel
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
