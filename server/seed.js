require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Auction = require('./models/Auction');

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing dummy data if any (optional, but good for clean slate if testing)
    // await User.deleteMany({});
    // await Auction.deleteMany({});

    // Hash common password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    console.log("Creating Users...");
    const users = await User.create([
      {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: hashedPassword,
        role: 'buyer'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: hashedPassword,
        role: 'buyer'
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        password: hashedPassword,
        role: 'buyer'
      }
    ]);

    const alice = users[0];
    const bob = users[1];

    // Create Auctions
    console.log("Creating Auctions...");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // 1 day ago (closed)

    await Auction.create([
      {
        title: 'Vintage Rolex Submariner 1980',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop',
        description: 'A beautifully preserved 1980 Vintage Rolex Submariner. Excellent condition with original box and papers. A true collector piece.',
        sellerName: alice.name,
        sellerEmail: alice.email,
        currentBid: 15000,
        highestBidder: '',
        endTime: futureDate,
        status: 'open',
        bids: []
      },
      {
        title: 'Modern Abstract Canvas Art',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=1200&auto=format&fit=crop',
        description: 'Stunning original abstract artwork by renowned contemporary artist. Perfect centerpiece for a modern living room.',
        sellerName: bob.name,
        sellerEmail: bob.email,
        currentBid: 2500,
        highestBidder: '',
        endTime: futureDate,
        status: 'open',
        bids: []
      },
      {
        title: 'Tesla Model S Plaid (Low Mileage)',
        image: 'https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=1200&auto=format&fit=crop',
        description: '2023 Tesla Model S Plaid in Deep Blue Metallic. Only 5,000 miles. 0-60 in 1.99s. Fully loaded with Full Self-Driving capability.',
        sellerName: alice.name,
        sellerEmail: alice.email,
        currentBid: 85000,
        highestBidder: '',
        endTime: futureDate,
        status: 'open',
        bids: []
      },
      {
        title: 'Apple MacBook Pro M3 Max 64GB',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
        description: 'Brand new, sealed in box. 16-inch MacBook Pro with M3 Max chip, 64GB Unified Memory, and 2TB SSD storage. Space Black.',
        sellerName: bob.name,
        sellerEmail: bob.email,
        currentBid: 4000,
        highestBidder: 'Alice Smith',
        endTime: pastDate,
        status: 'closed',
        bids: [
          { bidder: 'Alice Smith', amount: 4000 }
        ]
      }
    ]);

    console.log("Database seeded successfully!");
    console.log("-----------------------------------------");
    console.log("Created 3 users (password for all is 'password123'):");
    console.log("1. alice@example.com");
    console.log("2. bob@example.com");
    console.log("3. charlie@example.com");
    console.log("Created 4 auctions (3 live, 1 closed).");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
