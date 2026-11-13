require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected.');

    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('[Seed] Existing collections cleared.');

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const admin = await User.create({
      name: 'Alexander Wright',
      email: 'admin@hotelzen.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    const manager = await User.create({
      name: 'Sofia Martinez',
      email: 'manager@hotelzen.com',
      password: 'managerpassword123',
      role: 'manager',
      phone: '+971 4 829 1029',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    });

    const customer = await User.create({
      name: 'Ayush Ranjan',
      email: 'customer@hotelzen.com',
      password: 'customerpassword123',
      role: 'customer',
      phone: '+1 (555) 782-9931',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    // 2. Create Hotels
    console.log('[Seed] Creating luxury hotels...');
    const hotelsData = [
      {
        name: 'The Royal Mirage & Infinity Resort',
        description:
          'Set amidst lush landscaped gardens overlooking pristine azure waters, The Royal Mirage combines Arabian architectural majesty with contemporary luxury. Features world-class private beach access, a heated infinity pool overlooking the skyline, and award-winning Michelin-starred culinary journeys.',
        address: 'Al Sufouh Rd, Jumeirah Beach',
        city: 'Dubai',
        state: 'Dubai Emirate',
        country: 'United Arab Emirates',
        zipCode: '00000',
        starRating: 5,
        featuredImage:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
        ],
        amenities: [
          'Infinity Swimming Pool',
          'Private Beach Access',
          'Free High-Speed Wi-Fi',
          'Gourmet Dining & Lounge',
          'Wellness Spa & Hammam',
          'Valet Parking',
          'Helipad Transfer',
          '24/7 Butler Service',
        ],
        hotelType: 'Luxury Hotel',
        startingPrice: 3200,
        status: 'active',
        manager: manager._id,
        averageRating: 4.9,
        reviewsCount: 342,
      },
      {
        name: 'Aman Tokyo Sanctuary',
        description:
          'An urban sanctuary occupying the top six floors of the prestigious Otemachi Tower. Aman Tokyo balances urban dynamism with profound serenity, capturing traditional Japanese design elements with washi paper screens, camphor wood, and floor-to-ceiling vistas over the Imperial Palace gardens.',
        address: 'The Otemachi Tower, 1-5-6 Otemachi',
        city: 'Tokyo',
        state: 'Kanto',
        country: 'Japan',
        zipCode: '100-0004',
        starRating: 5,
        featuredImage:
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
        images: [
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        ],
        amenities: [
          'Onsen & Heated Pool',
          'Panoramic City Views',
          'Authentic Tea Ceremony',
          'Free High-Speed Wi-Fi',
          'Michelin Star Sushi Bar',
          'Fitness & Yoga Center',
          'Chauffeured Limousine',
        ],
        hotelType: 'Resort & Spa',
        startingPrice: 2450,
        status: 'active',
        averageRating: 4.95,
        reviewsCount: 215,
      },
      {
        name: 'Villa Premiere & Cliffside Retreat',
        description:
          'Perched majestically upon the dramatic cliffs of the Amalfi coastline, Villa Premiere provides breathtaking panoramic vistas of the Tyrrhenian Sea. Enjoy private sun terraces, Mediterranean gardens scented with lemon groves, and bespoke yacht excursions.',
        address: 'Via Panoramica 48',
        city: 'Amalfi',
        state: 'Salerno',
        country: 'Italy',
        zipCode: '84011',
        starRating: 5,
        featuredImage:
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80',
        images: [
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        ],
        amenities: [
          'Private Cliffside Plunge Pool',
          'Ocean Sunset Terrace',
          'Organic Wine Cellar',
          'Yacht Charter Service',
          'Gourmet Breakfast Included',
          'Free High-Speed Wi-Fi',
          'Concierge Service',
        ],
        hotelType: 'Villa',
        startingPrice: 3800,
        status: 'active',
        averageRating: 4.88,
        reviewsCount: 189,
      },
      {
        name: 'The Grand Alpine Palace',
        description:
          'Surrounded by majestic 4,000-meter snowcapped peaks in Zermatt with unobstructed vistas of the Matterhorn. Blends cozy alpine timber charm with five-star Swiss hospitality, heated thermal outdoor pools, ski-in/ski-out convenience, and world-renowned alpine spa therapies.',
        address: 'Matterhornstrasse 12',
        city: 'Zermatt',
        state: 'Valais',
        country: 'Switzerland',
        zipCode: '3920',
        starRating: 5,
        featuredImage:
          'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1600&q=80',
        images: [
          'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
        ],
        amenities: [
          'Ski-In / Ski-Out Access',
          'Heated Mountain Hydrotherapy',
          'Fireplace Lounges',
          'Swiss Fondue & Grill Room',
          'Luxury Spa & Saunas',
          'Ski Equipment Valet',
          'Free High-Speed Wi-Fi',
        ],
        hotelType: 'Resort & Spa',
        startingPrice: 1950,
        status: 'active',
        averageRating: 4.92,
        reviewsCount: 164,
      },
      {
        name: 'Caldera Cliffside Suites',
        description:
          'Carved into the volcanic caldera cliffs of Oia, Santorini, featuring whitewashed stone curves, private heated plunge pools facing the Aegean Sea, and world-famous sunset panoramas without the crowds.',
        address: 'Oia Pedestrian Walkway 104',
        city: 'Santorini',
        state: 'Cyclades',
        country: 'Greece',
        zipCode: '84702',
        starRating: 5,
        featuredImage:
          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80',
        images: [
          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        ],
        amenities: [
          'Private Plunge Pool',
          'Aegean Sunset Balcony',
          'Champagne Breakfast in Bed',
          'Free High-Speed Wi-Fi',
          'Helicopter Island Tours',
          'Full-Service Spa',
        ],
        hotelType: 'Boutique Hotel',
        startingPrice: 2800,
        status: 'active',
        averageRating: 4.96,
        reviewsCount: 420,
      },
      {
        name: 'The Beverly Hills Grand Estate',
        description:
          'Nestled on twelve lush acres of fragrant gardens and exotic flowers along Sunset Boulevard. An iconic legend of timeless Hollywood glamour, offering secluded garden bungalows, private cabanas by the legendary palm-fringed pool, and bespoke luxury hospitality.',
        address: '9641 Sunset Blvd',
        city: 'Los Angeles',
        state: 'California',
        country: 'United States',
        zipCode: '90210',
        starRating: 5,
        featuredImage:
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
        images: [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
        ],
        amenities: [
          'Cabana-Lined Palm Pool',
          'Valet & Bentley Towncar',
          'Polo Lounge & Bar',
          'Full-Service Luxury Spa',
          '24-Hour In-Room Dining',
          'Pet Concierge Service',
          'Free High-Speed Wi-Fi',
        ],
        hotelType: 'Luxury Hotel',
        startingPrice: 2100,
        status: 'active',
        averageRating: 4.84,
        reviewsCount: 290,
      },
    ];

    const createdHotels = await Hotel.insertMany(hotelsData);

    // Assign manager to first hotel (Dubai The Royal Mirage)
    manager.assignedHotel = createdHotels[0]._id;
    await manager.save();

    // 3. Create Rooms for each hotel
    console.log('[Seed] Creating luxury suites and rooms...');
    const roomTemplates = [
      {
        roomNumber: '101',
        roomType: 'Deluxe Suite',
        title: 'Executive Sea-View Suite',
        description:
          'Expansive private terrace with bespoke outdoor loungers, king-sized featherbed, marble en-suite bathroom with deep soaking tub and rainfall shower.',
        priceMultiplier: 1.0,
        capacity: { adults: 2, children: 1, totalGuests: 3 },
        bedType: 'King Bed',
        sizeInSqFt: 580,
        amenities: [
          'Private Terrace',
          'Ocean Sunset View',
          'High-Speed Wi-Fi',
          'Nespresso Bar',
          'Smart TV 65"',
          'Marble Deep Soaking Tub',
        ],
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        ],
      },
      {
        roomNumber: '201',
        roomType: 'Executive Suite',
        title: 'Grand Royal Skyline Suite',
        description:
          'Separate lavish living salon, dining area, walk-in dressing room, and dual balconies framing breathtaking panoramic horizons.',
        priceMultiplier: 1.45,
        capacity: { adults: 2, children: 2, totalGuests: 4 },
        bedType: 'California King',
        sizeInSqFt: 860,
        amenities: [
          'Panoramic Wrap-around Balcony',
          'Separate Living & Dining Area',
          'Walk-in Wardrobe',
          'Complimentary Champagne Bar',
          'High-Speed Wi-Fi',
          '24h Dedicated Butler',
        ],
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        ],
      },
      {
        roomNumber: 'PH-01',
        roomType: 'Presidential Villa',
        title: 'The Imperial Presidential Villa',
        description:
          'The pinnacle of ultra-luxury. Private heated infinity plunge pool, personal chef kitchen, master bedroom with 360-degree vistas, and private elevator access.',
        priceMultiplier: 2.3,
        capacity: { adults: 4, children: 2, totalGuests: 6 },
        bedType: 'California King',
        sizeInSqFt: 1450,
        amenities: [
          'Private Infinity Plunge Pool',
          'Private Rooftop Terrace',
          'Private Elevator Access',
          'Personal Sommelier & Chef',
          'Bose Surround Acoustic System',
          'Limousine Airport Transfer',
        ],
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
        ],
      },
    ];

    const allRooms = [];
    for (const hotel of createdHotels) {
      for (const tpl of roomTemplates) {
        allRooms.push({
          hotel: hotel._id,
          roomNumber: `${hotel.name.slice(0, 2).toUpperCase()}-${tpl.roomNumber}`,
          roomType: tpl.roomType,
          title: tpl.title,
          description: tpl.description,
          pricePerNight: Math.round(hotel.startingPrice * tpl.priceMultiplier),
          capacity: tpl.capacity,
          bedType: tpl.bedType,
          sizeInSqFt: tpl.sizeInSqFt,
          amenities: tpl.amenities,
          images: tpl.images,
          isAvailable: true,
          status: 'available',
        });
      }
    }

    const createdRooms = await Room.insertMany(allRooms);

    // 4. Create Initial Bookings to showcase dashboards
    console.log('[Seed] Creating demo bookings...');
    const today = new Date();
    const checkIn1 = new Date(today);
    checkIn1.setDate(today.getDate() + 7);
    const checkOut1 = new Date(checkIn1);
    checkOut1.setDate(checkIn1.getDate() + 4);

    const checkIn2 = new Date(today);
    checkIn2.setDate(today.getDate() - 14);
    const checkOut2 = new Date(today);
    checkOut2.setDate(today.getDate() - 10);

    const room1 = createdRooms[0];
    const room2 = createdRooms[1];

    const booking1 = await Booking.create({
      bookingReference: 'BK-DXB901',
      user: customer._id,
      hotel: room1.hotel,
      room: room1._id,
      checkInDate: checkIn1,
      checkOutDate: checkOut1,
      totalNights: 4,
      pricePerNight: room1.pricePerNight,
      taxesAndFees: Math.round(room1.pricePerNight * 4 * 0.12),
      totalPrice: room1.pricePerNight * 4 + Math.round(room1.pricePerNight * 4 * 0.12),
      guests: { adults: 2, children: 1 },
      guestDetails: {
        fullName: 'Ayush Ranjan',
        email: 'customer@hotelzen.com',
        phone: '+1 (555) 782-9931',
        specialRequests: 'High floor, late check-in around 8 PM please.',
      },
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      bookingStatus: 'confirmed',
    });

    const booking2 = await Booking.create({
      bookingReference: 'BK-ROM482',
      user: customer._id,
      hotel: room2.hotel,
      room: room2._id,
      checkInDate: checkIn2,
      checkOutDate: checkOut2,
      totalNights: 4,
      pricePerNight: room2.pricePerNight,
      taxesAndFees: Math.round(room2.pricePerNight * 4 * 0.12),
      totalPrice: room2.pricePerNight * 4 + Math.round(room2.pricePerNight * 4 * 0.12),
      guests: { adults: 2, children: 0 },
      guestDetails: {
        fullName: 'Ayush Ranjan',
        email: 'customer@hotelzen.com',
        phone: '+1 (555) 782-9931',
        specialRequests: 'Anniversary celebration.',
      },
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      bookingStatus: 'completed',
    });

    console.log('[Seed] Database successfully seeded with:');
    console.log(`- ${3} Users (Admin: admin@hotelzen.com, Manager: manager@hotelzen.com, Customer: customer@hotelzen.com)`);
    console.log(`- ${createdHotels.length} Luxury Hotels`);
    console.log(`- ${createdRooms.length} Hotel Rooms/Suites`);
    console.log(`- ${2} Demo Bookings (Upcoming and Completed)`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
