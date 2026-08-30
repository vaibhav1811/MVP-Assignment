const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing records in reverse dependency order
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned previous database records.');

  // Create hashed passwords
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const sellerPasswordHash = await bcrypt.hash('SellerPassword123!', 10);
  const buyerPasswordHash = await bcrypt.hash('BuyerPassword123!', 10);

  // 1. Seed Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@marketplace.local',
      hashedPassword: adminPasswordHash,
      role: 'admin',
    },
  });
  console.log(`✅ Admin created: ${admin.email} (Password: AdminPassword123!)`);

  // 2. Seed Seller
  const seller = await prisma.user.create({
    data: {
      name: 'Acme Electronics & Goods',
      email: 'seller@marketplace.local',
      hashedPassword: sellerPasswordHash,
      role: 'seller',
    },
  });
  console.log(`✅ Seller created: ${seller.email} (Password: SellerPassword123!)`);

  // 3. Seed Buyer
  const buyer = await prisma.user.create({
    data: {
      name: 'Jane Buyer',
      email: 'buyer@marketplace.local',
      hashedPassword: buyerPasswordHash,
      role: 'buyer',
    },
  });
  console.log(`✅ Buyer created: ${buyer.email} (Password: BuyerPassword123!)`);

  // 4. Seed Listings
  const sampleListings = [
    {
      title: 'Noise-Cancelling Wireless Headphones Pro',
      description: 'Premium over-ear headphones with active noise cancellation, 40-hour battery life, and spatial audio.',
      price: 199.99,
      quantityAvailable: 15,
      isActive: true,
      sellerId: seller.id,
    },
    {
      title: 'RGB Mechanical Gaming Keyboard',
      description: 'Hot-swappable tactile mechanical switches, per-key RGB backlighting, and durable aluminum top plate.',
      price: 89.50,
      quantityAvailable: 25,
      isActive: true,
      sellerId: seller.id,
    },
    {
      title: 'Ergonomic Mesh Office Chair',
      description: 'Breathable high-density mesh with adjustable lumbar support, 3D armrests, and synchro-tilt mechanism.',
      price: 249.00,
      quantityAvailable: 8,
      isActive: true,
      sellerId: seller.id,
    },
    {
      title: 'Ultra-Wide 34" Curved 4K Monitor',
      description: '144Hz refresh rate, 1ms response time, HDR400, and integrated USB-C 90W power delivery hub.',
      price: 499.99,
      quantityAvailable: 6,
      isActive: true,
      sellerId: seller.id,
    },
    {
      title: 'Smart Fitness Tracker Series X',
      description: 'Continuous heart rate monitoring, SpO2 sensor, sleep staging, built-in GPS, and 50m water resistance.',
      price: 129.99,
      quantityAvailable: 20,
      isActive: true,
      sellerId: seller.id,
    },
    {
      title: 'USB-C 8-in-1 Aluminum Hub Dock',
      description: 'Dual 4K HDMI, 100W Power Delivery pass-through, SD/microSD slots, and 3x USB 3.2 Gen 2 ports.',
      price: 39.99,
      quantityAvailable: 40,
      isActive: true,
      sellerId: seller.id,
    },
  ];

  const createdListings = [];
  for (const item of sampleListings) {
    const listing = await prisma.listing.create({ data: item });
    createdListings.push(listing);
  }
  console.log(`✅ Seeded ${createdListings.length} product listings.`);

  // 5. Seed an Initial Sample Order
  const sampleOrder = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      listingId: createdListings[0].id,
      quantity: 1,
      totalPrice: createdListings[0].price,
      status: 'pending',
    },
  });
  console.log(`✅ Seeded sample pending order: ID ${sampleOrder.id}`);

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
