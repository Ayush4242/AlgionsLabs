const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

class HotelService {
  async getAllHotels(query) {
    const {
      search,
      city,
      country,
      minPrice,
      maxPrice,
      starRating,
      hotelType,
      amenity,
      sort,
      page = 1,
      limit = 12,
    } = query;

    const filter = { status: 'active' };

    // Search term across name, city, country, or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (country) {
      filter.country = { $regex: country, $options: 'i' };
    }

    if (hotelType && hotelType !== 'all') {
      filter.hotelType = hotelType;
    }

    if (starRating) {
      filter.starRating = { $gte: Number(starRating) };
    }

    if (minPrice || maxPrice) {
      filter.startingPrice = {};
      if (minPrice) filter.startingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.startingPrice.$lte = Number(maxPrice);
    }

    if (amenity) {
      const amenitiesList = Array.isArray(amenity) ? amenity : [amenity];
      filter.amenities = { $all: amenitiesList };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { startingPrice: 1 };
    else if (sort === 'price_desc') sortOptions = { startingPrice: -1 };
    else if (sort === 'rating_desc') sortOptions = { averageRating: -1, starRating: -1 };
    else if (sort === 'popularity') sortOptions = { reviewsCount: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .populate('manager', 'name email'),
      Hotel.countDocuments(filter),
    ]);

    return {
      hotels,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    };
  }

  async getFeaturedHotels(limit = 6) {
    return await Hotel.find({ status: 'active' })
      .sort({ averageRating: -1, starRating: -1 })
      .limit(Number(limit));
  }

  async getPopularDestinations() {
    return await Hotel.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: { city: '$city', country: '$country' },
          count: { $sum: 1 },
          image: { $first: '$featuredImage' },
          minPrice: { $min: '$startingPrice' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          count: 1,
          image: 1,
          minPrice: 1,
        },
      },
    ]);
  }

  async getHotelById(id) {
    const hotel = await Hotel.findById(id).populate('manager', 'name email phone');
    if (!hotel) {
      const error = new Error('Hotel not found');
      error.statusCode = 404;
      throw error;
    }

    // Fetch rooms belonging to this hotel
    const rooms = await Room.find({ hotel: id, isAvailable: true });

    return {
      hotel,
      rooms,
    };
  }

  async createHotel(hotelData) {
    const hotel = await Hotel.create(hotelData);
    return hotel;
  }

  async updateHotel(id, updateData) {
    const hotel = await Hotel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!hotel) {
      const error = new Error('Hotel not found');
      error.statusCode = 404;
      throw error;
    }
    return hotel;
  }

  async deleteHotel(id) {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      const error = new Error('Hotel not found');
      error.statusCode = 404;
      throw error;
    }

    // Also remove associated rooms
    await Room.deleteMany({ hotel: id });
    await Hotel.findByIdAndDelete(id);

    return { message: 'Hotel and associated rooms removed successfully' };
  }
}

module.exports = new HotelService();
