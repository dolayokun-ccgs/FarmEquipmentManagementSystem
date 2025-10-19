import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Categories
  console.log('📁 Creating equipment categories...');

  const categories = [
    {
      name: 'Tractors',
      description: 'Compact and utility tractors for various farm operations',
    },
    {
      name: 'Tillers & Cultivators',
      description: 'Soil preparation and cultivation equipment',
    },
    {
      name: 'Planting Equipment',
      description: 'Seeders, planters, and transplanting machines',
    },
    {
      name: 'Harvesting Equipment',
      description: 'Harvesters, reapers, and threshers',
    },
    {
      name: 'Irrigation Systems',
      description: 'Water pumps, sprinklers, and drip irrigation',
    },
    {
      name: 'Sprayers',
      description: 'Pesticide and fertilizer application equipment',
    },
    {
      name: 'Mowers & Cutters',
      description: 'Grass cutters, brush cutters, and hay mowers',
    },
    {
      name: 'Post Harvest Equipment',
      description: 'Threshers, winnowers, and grain cleaners',
    },
    {
      name: 'Transport & Handling',
      description: 'Farm trailers, carts, and material handlers',
    },
    {
      name: 'Power Tools',
      description: 'Generators, water pumps, and power equipment',
    },
  ];

  const createdCategories: Record<string, any> = {};
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories[category.name] = created;
    console.log(`✅ Created category: ${category.name}`);
  }

  // Create Sample Users
  console.log('👥 Creating sample users...');

  const passwordHash = await bcrypt.hash('Password123', 10);

  await prisma.user.upsert({
    where: { email: 'farmer1@example.com' },
    update: {},
    create: {
      email: 'farmer1@example.com',
      passwordHash,
      firstName: 'Adebayo',
      lastName: 'Oladele',
      phoneNumber: '+234 803 456 7890',
      state: 'Lagos',
      lga: 'IKE',
      role: 'FARMER',
      provider: 'LOCAL',
      isVerified: true,
    },
  });
  console.log('✅ Created farmer: Adebayo Oladele');

  const owner1 = await prisma.user.upsert({
    where: { email: 'ibadan-north@oyo.gov.ng' },
    update: {},
    create: {
      email: 'ibadan-north@oyo.gov.ng',
      passwordHash,
      firstName: 'Ibadan North',
      lastName: 'LGA',
      phoneNumber: '+234 802 100 1000',
      state: 'Oyo',
      lga: 'IBA',
      role: 'PLATFORM_OWNER',
      provider: 'LOCAL',
      isVerified: true,
    },
  });
  console.log('✅ Created government entity: Ibadan North LGA');

  const owner2 = await prisma.user.upsert({
    where: { email: 'abeokuta-north@ogun.gov.ng' },
    update: {},
    create: {
      email: 'abeokuta-north@ogun.gov.ng',
      passwordHash,
      firstName: 'Abeokuta North',
      lastName: 'LGA',
      phoneNumber: '+234 803 200 2000',
      state: 'Ogun',
      lga: 'ABN',
      role: 'PLATFORM_OWNER',
      provider: 'LOCAL',
      isVerified: true,
    },
  });
  console.log('✅ Created government entity: Abeokuta North LGA');

  // Create Sample Equipment
  console.log('🚜 Creating sample equipment...');

  const equipmentData = [
    // Tractors
    {
      ownerId: owner1.id,
      name: 'John Deere 5055E Utility Tractor',
      description: 'A reliable 55HP utility tractor perfect for small to medium farms. Features 4WD, power steering, and multiple PTO options. Ideal for plowing, tilling, and hauling operations.',
      categoryId: createdCategories['Tractors'].id,
      pricePerDay: 25000,
      condition: 'EXCELLENT',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/tractor-john-deere.jpg',
      ]),
      specifications: JSON.stringify({
        'Engine Power': '55 HP',
        'Drive Type': '4WD',
        'Transmission': 'Synchro Shuttle',
        'PTO Speed': '540 RPM',
        'Fuel Type': 'Diesel',
        'Weight': '2,400 kg',
      }),
    },
    {
      ownerId: owner2.id,
      name: 'Kubota M5-111 Compact Tractor',
      description: 'Versatile 111HP compact tractor with cab. Perfect for livestock farms and crop production. Features hydraulic shuttle transmission and comfortable operator cabin.',
      categoryId: createdCategories['Tractors'].id,
      pricePerDay: 35000,
      condition: 'GOOD',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/tractor-kubota.jpg',
      ]),
      specifications: JSON.stringify({
        'Engine Power': '111 HP',
        'Drive Type': '4WD',
        'Transmission': 'Hydraulic Shuttle',
        'Cabin': 'Enclosed with AC',
        'Fuel Type': 'Diesel',
      }),
    },

    // Tillers & Cultivators
    {
      ownerId: owner1.id,
      name: 'Rotary Tiller 6ft Wide',
      description: 'Heavy-duty 6ft rotary tiller for soil preparation. Suitable for tractors 40HP and above. Perfect for breaking new ground and preparing seed beds.',
      categoryId: createdCategories['Tillers & Cultivators'].id,
      pricePerDay: 8000,
      condition: 'GOOD',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/rotary-tiller.jpg',
      ]),
      specifications: JSON.stringify({
        'Width': '6 feet (1.8m)',
        'Tilling Depth': 'Up to 8 inches',
        'Required Tractor HP': '40+ HP',
        'Blades': 'Hardened steel',
        'PTO Speed': '540 RPM',
      }),
    },
    {
      ownerId: owner2.id,
      name: 'Walk-Behind Power Tiller',
      description: 'Compact 7HP walk-behind tiller ideal for small farms and gardens. Easy to maneuver and perfect for vegetable farming.',
      categoryId: createdCategories['Tillers & Cultivators'].id,
      pricePerDay: 5000,
      condition: 'EXCELLENT',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/power-tiller.jpg',
      ]),
      specifications: JSON.stringify({
        'Engine Power': '7 HP',
        'Fuel Type': 'Petrol',
        'Tilling Width': '24 inches',
        'Tilling Depth': 'Up to 6 inches',
        'Weight': '65 kg',
      }),
    },

    // Planting Equipment
    {
      ownerId: owner1.id,
      name: 'Maize Seed Planter (4-Row)',
      description: 'Precision 4-row maize planter with adjustable spacing. Ensures uniform seed distribution and optimal plant population.',
      categoryId: createdCategories['Planting Equipment'].id,
      pricePerDay: 12000,
      condition: 'GOOD',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/maize-planter.jpg',
      ]),
      specifications: JSON.stringify({
        'Number of Rows': '4',
        'Row Spacing': 'Adjustable (75cm standard)',
        'Seed Hopper': '20 kg capacity',
        'Fertilizer Hopper': '15 kg capacity',
        'Required Tractor HP': '35+ HP',
      }),
    },
    {
      ownerId: owner2.id,
      name: 'Rice Transplanter',
      description: 'Manual rice transplanter for paddy fields. Increases planting efficiency and reduces labor costs.',
      categoryId: createdCategories['Planting Equipment'].id,
      pricePerDay: 6000,
      condition: 'FAIR',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/rice-transplanter.jpg',
      ]),
      specifications: JSON.stringify({
        'Type': 'Manual/Walk-behind',
        'Number of Rows': '6',
        'Row Spacing': '30 cm',
        'Planting Speed': '0.5 acre/day',
      }),
    },

    // Harvesting Equipment
    {
      ownerId: owner1.id,
      name: 'Mini Combine Harvester',
      description: 'Compact combine harvester suitable for rice, wheat, and other grains. Perfect for small to medium farms.',
      categoryId: createdCategories['Harvesting Equipment'].id,
      pricePerDay: 45000,
      condition: 'EXCELLENT',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/combine-harvester.jpg',
      ]),
      specifications: JSON.stringify({
        'Engine Power': '48 HP',
        'Working Width': '1.2 meters',
        'Grain Tank': '400 kg',
        'Fuel Type': 'Diesel',
        'Harvesting Speed': '1 acre/hour',
      }),
    },
    {
      ownerId: owner2.id,
      name: 'Cassava Harvester',
      description: 'Tractor-mounted cassava harvester. Efficiently digs and lifts cassava tubers with minimal damage.',
      categoryId: createdCategories['Harvesting Equipment'].id,
      pricePerDay: 18000,
      condition: 'GOOD',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/cassava-harvester.jpg',
      ]),
      specifications: JSON.stringify({
        'Type': 'Tractor-mounted',
        'Working Width': '90 cm',
        'Depth': 'Up to 40 cm',
        'Required Tractor HP': '50+ HP',
      }),
    },

    // Irrigation Systems
    {
      ownerId: owner1.id,
      name: 'Diesel Water Pump 3-inch',
      description: 'High-capacity 3-inch diesel water pump. Ideal for irrigation, drainage, and water transfer. Flow rate up to 60,000 liters per hour.',
      categoryId: createdCategories['Irrigation Systems'].id,
      pricePerDay: 7000,
      condition: 'EXCELLENT',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/water-pump.jpg',
      ]),
      specifications: JSON.stringify({
        'Engine Type': 'Diesel',
        'Inlet/Outlet': '3 inches',
        'Max Flow': '60,000 L/hour',
        'Max Head': '25 meters',
        'Fuel Tank': '15 liters',
      }),
    },
    {
      ownerId: owner2.id,
      name: 'Drip Irrigation System (1 Acre)',
      description: 'Complete drip irrigation kit for 1 acre. Includes main line, lateral lines, drippers, and filters. Water-efficient system.',
      categoryId: createdCategories['Irrigation Systems'].id,
      pricePerDay: 4000,
      condition: 'GOOD',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/drip-irrigation.jpg',
      ]),
      specifications: JSON.stringify({
        'Coverage': '1 acre',
        'Dripper Spacing': '30 cm',
        'Flow Rate': '2-4 L/hour per dripper',
        'Filter Type': 'Screen filter',
        'Pressure Requirement': '1-2 bar',
      }),
    },

    // Sprayers
    {
      ownerId: owner1.id,
      name: 'Motorized Knapsack Sprayer',
      description: 'Petrol-powered knapsack sprayer with 20L tank. Perfect for pesticide and fertilizer application on medium-sized farms.',
      categoryId: createdCategories['Sprayers'].id,
      pricePerDay: 3500,
      condition: 'EXCELLENT',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/boom-sprayer.jpg',
      ]),
      specifications: JSON.stringify({
        'Engine Type': 'Petrol 2-stroke',
        'Tank Capacity': '20 liters',
        'Spray Range': 'Up to 8 meters',
        'Coverage': '2-3 acres/day',
        'Weight': '10 kg (empty)',
      }),
    },
    {
      ownerId: owner2.id,
      name: 'Boom Sprayer (Tractor-Mounted)',
      description: 'Tractor-mounted boom sprayer with 200L tank and 6-meter boom. Efficient coverage for large fields.',
      categoryId: createdCategories['Sprayers'].id,
      pricePerDay: 15000,
      condition: 'GOOD',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/drip-irrigation.jpg',
      ]),
      specifications: JSON.stringify({
        'Tank Capacity': '200 liters',
        'Boom Width': '6 meters',
        'Nozzles': 'Adjustable',
        'Required Tractor HP': '40+ HP',
        'Coverage': '5-8 acres/hour',
      }),
    },

    // Mowers & Cutters
    {
      ownerId: owner1.id,
      name: 'Brush Cutter (Petrol)',
      description: 'Professional-grade petrol brush cutter for clearing vegetation and grass. Includes blade and trimmer line head.',
      categoryId: createdCategories['Mowers & Cutters'].id,
      pricePerDay: 2500,
      condition: 'EXCELLENT',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/brush-cutter.jpg',
      ]),
      specifications: JSON.stringify({
        'Engine': '2-stroke petrol',
        'Displacement': '52cc',
        'Cutting Width': '45 cm',
        'Weight': '7.5 kg',
        'Attachments': 'Blade and trimmer head',
      }),
    },
    {
      ownerId: owner2.id,
      name: 'Hay Mower (Tractor-Mounted)',
      description: 'Rotary hay mower for cutting grass and fodder. Suitable for small to medium livestock farms.',
      categoryId: createdCategories['Mowers & Cutters'].id,
      pricePerDay: 10000,
      condition: 'GOOD',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/combine-harvester.jpg',
      ]),
      specifications: JSON.stringify({
        'Cutting Width': '1.2 meters',
        'Type': 'Rotary disc',
        'Required Tractor HP': '30+ HP',
        'PTO Speed': '540 RPM',
      }),
    },

    // Post Harvest Equipment
    {
      ownerId: owner1.id,
      name: 'Multi-Crop Thresher',
      description: 'Versatile thresher for maize, beans, rice, and other grains. Electric motor powered, suitable for small processing operations.',
      categoryId: createdCategories['Post Harvest Equipment'].id,
      pricePerDay: 8000,
      condition: 'GOOD',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/combine-harvester.jpg',
      ]),
      specifications: JSON.stringify({
        'Motor': '5 HP electric',
        'Capacity': '500 kg/hour',
        'Suitable Crops': 'Maize, beans, rice, wheat',
        'Power': '220V single phase',
      }),
    },
    {
      ownerId: owner2.id,
      name: 'Grain Winnower',
      description: 'Electric grain cleaning and winnowing machine. Removes chaff and foreign materials from harvested grains.',
      categoryId: createdCategories['Post Harvest Equipment'].id,
      pricePerDay: 5000,
      condition: 'EXCELLENT',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/rice-transplanter.jpg',
      ]),
      specifications: JSON.stringify({
        'Motor': '3 HP electric',
        'Capacity': '300 kg/hour',
        'Cleaning Efficiency': '98%',
        'Power': '220V',
      }),
    },

    // Transport & Handling
    {
      ownerId: owner1.id,
      name: 'Farm Trailer (2-Ton Capacity)',
      description: 'Heavy-duty farm trailer for transporting produce, equipment, and materials. Hydraulic tipping feature.',
      categoryId: createdCategories['Transport & Handling'].id,
      pricePerDay: 6000,
      condition: 'GOOD',
      locationAddress: '12 Farm Road, Ibadan',
      locationCity: 'Ibadan',
      locationState: 'Oyo',
      latitude: 7.3775,
      longitude: 3.9470,
      images: JSON.stringify([
        '/images/equipment/cassava-harvester.jpg',
      ]),
      specifications: JSON.stringify({
        'Capacity': '2 tons',
        'Bed Size': '2.5m x 1.5m',
        'Tipping': 'Hydraulic',
        'Wheels': 'Dual axle',
        'Hitch': 'Standard tractor hitch',
      }),
    },

    // Power Tools
    {
      ownerId: owner2.id,
      name: 'Diesel Generator 10KVA',
      description: 'Reliable 10KVA diesel generator for powering farm operations. Suitable for irrigation pumps, processing equipment, and lighting.',
      categoryId: createdCategories['Power Tools'].id,
      pricePerDay: 9000,
      condition: 'EXCELLENT',
      locationAddress: 'Abeokuta Industrial Area',
      locationCity: 'Abeokuta',
      locationState: 'Ogun',
      latitude: 7.1475,
      longitude: 3.3619,
      images: JSON.stringify([
        '/images/equipment/diesel-generator.jpg',
      ]),
      specifications: JSON.stringify({
        'Power Output': '10 KVA / 8 KW',
        'Engine': 'Diesel',
        'Fuel Tank': '40 liters',
        'Runtime': '8-10 hours (full tank)',
        'Voltage': '220V/380V',
      }),
    },
  ];

  for (const equipment of equipmentData) {
    await prisma.equipment.create({
      data: equipment,
    });
    console.log(`✅ Created equipment: ${equipment.name}`);
  }

  console.log('✨ Database seeding completed successfully!');
  console.log(`
📊 Summary:
- ${categories.length} categories created
- 3 users created (1 farmer, 2 government entities)
- ${equipmentData.length} equipment items created

🔑 Test Credentials:
Farmer: farmer1@example.com / Password123
Ibadan North LGA: ibadan-north@oyo.gov.ng / Password123
Abeokuta North LGA: abeokuta-north@ogun.gov.ng / Password123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
