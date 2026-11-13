const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hotel name'],
      trim: true,
      maxlength: [100, 'Hotel name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide hotel description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please provide street address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      trim: true,
      index: true,
    },
    zipCode: {
      type: String,
      trim: true,
      default: '',
    },
    starRating: {
      type: Number,
      required: [true, 'Please provide star rating (1-5)'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
      default: 5,
    },
    featuredImage: {
      type: String,
      required: [true, 'Please provide a featured cover image URL'],
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [
        'Free High-Speed Wi-Fi',
        'Infinity Swimming Pool',
        'Wellness Spa & Sauna',
        'Fine Dining Restaurant',
        'Valet Parking',
        '24/7 Room Service',
        'Fitness Center',
        'Airport Shuttle',
      ],
    },
    hotelType: {
      type: String,
      enum: ['Luxury Hotel', 'Resort & Spa', 'Boutique Hotel', 'Villa', 'Business Hotel'],
      default: 'Luxury Hotel',
    },
    startingPrice: {
      type: Number,
      required: [true, 'Please provide starting price per night'],
      min: [0, 'Price must be positive'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    averageRating: {
      type: Number,
      default: 4.8,
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for rooms belonging to this hotel
hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false,
});

// Auto-generate slug before save
hotelSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);
