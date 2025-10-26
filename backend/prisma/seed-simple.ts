import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Categories
  console.log('📁 Creating categories...');
  const tractorCat = await prisma.category.upsert({
    where: { name: 'Tractors' },
    update: {},
    create: { name: 'Tractors', description: 'Various types of tractors', iconUrl: '🚜' },
  });
  const harvesterCat = await prisma.category.upsert({
    where: { name: 'Harvesters' },
    update: {},
    create: { name: 'Harvesters', description: 'Combine harvesters', iconUrl: '🌾' },
  });
  const planterCat = await prisma.category.upsert({
    where: { name: 'Planters & Seeders' },
    update: {},
    create: { name: 'Planters & Seeders', description: 'Planting equipment', iconUrl: '🌱' },
  });
  const irrigationCat = await prisma.category.upsert({
    where: { name: 'Irrigation Systems' },
    update: {},
    create: { name: 'Irrigation Systems', description: 'Water irrigation systems', iconUrl: '💧' },
  });
  console.log('✓ Created 4 categories\n');

  // 2. Create Government Owners
  console.log('👥 Creating government equipment owners...');
  const lagos = await prisma.user.upsert({
    where: { email: 'lagos.agric@gov.ng' },
    update: {},
    create: {
      email: 'lagos.agric@gov.ng',
      passwordHash: hashedPassword,
      firstName: 'Lagos State',
      lastName: 'Agricultural Development',
      phoneNumber: '+234 800 123 4567',
      state: 'Lagos',
      lga: 'Ikeja',
      role: 'PLATFORM_OWNER',
      isVerified: true,
    },
  });

  const kano = await prisma.user.upsert({
    where: { email: 'kano.agric@gov.ng' },
    update: {},
    create: {
      email: 'kano.agric@gov.ng',
      passwordHash: hashedPassword,
      firstName: 'Kano State',
      lastName: 'Agricultural Agency',
      phoneNumber: '+234 800 234 5678',
      state: 'Kano',
      lga: 'Kano Municipal',
      role: 'PLATFORM_OWNER',
      isVerified: true,
    },
  });

  const oyo = await prisma.user.upsert({
    where: { email: 'oyo.agric@gov.ng' },
    update: {},
    create: {
      email: 'oyo.agric@gov.ng',
      passwordHash: hashedPassword,
      firstName: 'Oyo State',
      lastName: 'Ministry of Agriculture',
      phoneNumber: '+234 800 345 6789',
      state: 'Oyo',
      lga: 'Ibadan North',
      role: 'PLATFORM_OWNER',
      isVerified: true,
    },
  });

  console.log('✓ Created 3 government owners\n');

  // 3. Create Farmers
  console.log('👨‍🌾 Creating farmers...');
  await prisma.user.create({
    data: {
      email: 'chinedu.okafor@farmer.ng',
      passwordHash: hashedPassword,
      firstName: 'Chinedu',
      lastName: 'Okafor',
      phoneNumber: '+234 700 111 2222',
      state: 'Enugu',
      lga: 'Enugu North',
      role: 'FARMER',
      isVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'aisha.mohammed@farmer.ng',
      passwordHash: hashedPassword,
      firstName: 'Aisha',
      lastName: 'Mohammed',
      phoneNumber: '+234 701 222 3333',
      state: 'Kano',
      lga: 'Gwale',
      role: 'FARMER',
      isVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'oluwaseun.adeyemi@farmer.ng',
      passwordHash: hashedPassword,
      firstName: 'Oluwaseun',
      lastName: 'Adeyemi',
      phoneNumber: '+234 702 333 4444',
      state: 'Oyo',
      lga: 'Ibadan South',
      role: 'FARMER',
      isVerified: true,
    },
  });

  console.log('✓ Created 3 farmers\n');

  // 4. Create Equipment
  console.log('🚜 Creating equipment...');

  await prisma.equipment.create({
    data: {
      ownerId: lagos.id,
      name: 'John Deere 5075E Tractor',
      description: 'Modern utility tractor perfect for medium-scale farming operations. Features air-conditioned cabin, power steering, and excellent fuel efficiency.',
      categoryId: tractorCat.id,
      pricePerDay: 45000,
      condition: 'EXCELLENT',
      locationAddress: 'Lagos State Agricultural Development Authority',
      locationCity: 'Ikeja',
      locationState: 'Lagos',
      images: JSON.stringify(['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800']),
      specifications: JSON.stringify({ 'Engine Power': '75 HP', 'Year': '2022' }),
      tags: JSON.stringify(['land_preparation']),
      isAvailable: true,
    },
  });

  await prisma.equipment.create({
    data: {
      ownerId: lagos.id,
      name: 'Modern Rice Combine Harvester',
      description: 'State-of-the-art combine harvester specifically designed for rice farming. High efficiency and minimal grain loss.',
      categoryId: harvesterCat.id,
      pricePerDay: 120000,
      condition: 'EXCELLENT',
      locationAddress: 'Badagry Farm Settlement',
      locationCity: 'Badagry',
      locationState: 'Lagos',
      images: JSON.stringify(['https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800']),
      specifications: JSON.stringify({ 'Cutting Width': '4.5 meters', 'Year': '2023' }),
      tags: JSON.stringify(['harvesting']),
      isAvailable: true,
    },
  });

  await prisma.equipment.create({
    data: {
      ownerId: kano.id,
      name: 'New Holland TD90 Tractor',
      description: 'Reliable and efficient tractor suitable for all farming operations. Low maintenance and great performance.',
      categoryId: tractorCat.id,
      pricePerDay: 48000,
      condition: 'GOOD',
      locationAddress: 'Kano Agricultural Supply Centre',
      locationCity: 'Kano',
      locationState: 'Kano',
      images: JSON.stringify(['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800']),
      specifications: JSON.stringify({ 'Engine Power': '90 HP', 'Year': '2022' }),
      tags: JSON.stringify(['land_preparation']),
      isAvailable: true,
    },
  });

  await prisma.equipment.create({
    data: {
      ownerId: kano.id,
      name: 'Precision Seed Planter',
      description: 'Advanced planting equipment with GPS guidance for accurate seed placement. Perfect for corn, sorghum, and millet.',
      categoryId: planterCat.id,
      pricePerDay: 35000,
      condition: 'EXCELLENT',
      locationAddress: 'Gwale Extension Center',
      locationCity: 'Kano',
      locationState: 'Kano',
      images: JSON.stringify(['https://images.unsplash.com/photo-1625246293087-3b0c0c67e6f4?w=800']),
      specifications: JSON.stringify({ 'Number of Rows': '8', 'Year': '2023' }),
      tags: JSON.stringify(['planting']),
      isAvailable: true,
    },
  });

  await prisma.equipment.create({
    data: {
      ownerId: oyo.id,
      name: 'Kubota M7060 Tractor',
      description: 'Premium tractor with excellent power-to-weight ratio. Ideal for cassava, yam, and maize farming.',
      categoryId: tractorCat.id,
      pricePerDay: 52000,
      condition: 'EXCELLENT',
      locationAddress: 'Ibadan North Agricultural Zone',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      images: JSON.stringify(['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800']),
      specifications: JSON.stringify({ 'Engine Power': '70 HP', 'Year': '2023' }),
      tags: JSON.stringify(['land_preparation']),
      isAvailable: true,
    },
  });

  await prisma.equipment.create({
    data: {
      ownerId: oyo.id,
      name: 'Drip Irrigation System - 5 Hectares',
      description: 'Complete drip irrigation system suitable for 5 hectares. Water-efficient and perfect for vegetable farming.',
      categoryId: irrigationCat.id,
      pricePerDay: 25000,
      condition: 'EXCELLENT',
      locationAddress: 'Saki Agricultural Hub',
      locationCity: 'Saki',
      locationState: 'Oyo',
      images: JSON.stringify(['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800']),
      specifications: JSON.stringify({ 'Coverage': '5 hectares', 'Year': '2023' }),
      tags: JSON.stringify(['crop_management']),
      isAvailable: true,
    },
  });

  console.log('✓ Created 6 equipment items\n');

  console.log('✅ Database seeding completed!\n');
  console.log('📊 Summary:');
  console.log('   - Categories: 4');
  console.log('   - Government Owners: 3');
  console.log('   - Farmers: 3');
  console.log('   - Equipment: 6\n');
  console.log('🔐 Login Credentials:');
  console.log('   Government:');
  console.log('   - lagos.agric@gov.ng');
  console.log('   - kano.agric@gov.ng');
  console.log('   - oyo.agric@gov.ng');
  console.log('   Farmers:');
  console.log('   - chinedu.okafor@farmer.ng');
  console.log('   - aisha.mohammed@farmer.ng');
  console.log('   - oluwaseun.adeyemi@farmer.ng');
  console.log('   Password: password123\n');
  console.log('🌐 Browse equipment: http://localhost:3001/equipment');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
