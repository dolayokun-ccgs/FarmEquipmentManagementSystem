const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

// Map of Unsplash URLs to local paths
const replacements = [
  ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800', '/images/equipment/power-tiller.jpg'],
  ['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800', '/images/equipment/maize-planter.jpg'],
  ['https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800', '/images/equipment/rice-transplanter.jpg'],
  ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800', '/images/equipment/combine-harvester.jpg'],
  ['https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=800', '/images/equipment/cassava-harvester.jpg'],
  ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800', '/images/equipment/water-pump.jpg'],
  ['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800', '/images/equipment/drip-irrigation.jpg'],
  ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', '/images/equipment/boom-sprayer.jpg'],
  ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', '/images/equipment/brush-cutter.jpg'],
  ['https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800', '/images/equipment/hay-mower.jpg'],
  ['https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800', '/images/equipment/diesel-generator.jpg'],
  ['https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800', '/images/equipment/grain-thresher.jpg'],
  ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', '/images/equipment/farm-trailer.jpg'],
];

// Replace all URLs
replacements.forEach(([oldUrl, newPath]) => {
  content = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
});

fs.writeFileSync(seedPath, content, 'utf8');
console.log('✅ Updated all image URLs to use local paths');
