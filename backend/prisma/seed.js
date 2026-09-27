const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialCategories = [
  {
    name: 'Organic Waste',
    description: 'Food scraps, yard trimmings, coffee grounds, and compostable biological materials.',
    icon: 'Leaf',
    disposalInstructions: 'Collect in biodegradable liners. Keep free from plastic packaging, glass, or metals. Suitable for compost processing.',
    color: '#16A34A',
  },
  {
    name: 'Recyclable Waste',
    description: 'Clean containers, metals, tins, aluminum cans, and mixed non-hazardous recyclables.',
    icon: 'Recycle',
    disposalInstructions: 'Rinse thoroughly to remove food residues. Let dry before placing in collection bin. Do not bag recyclables in black plastic.',
    color: '#059669',
  },
  {
    name: 'Paper & Cardboard',
    description: 'Corrugated cartons, packaging boxes, newspapers, magazines, office papers, and paper bags.',
    icon: 'Package',
    disposalInstructions: 'Flatten all cartons and cardboard to conserve transport space. Ensure materials are dry and free from oil, grease, or wax coatings.',
    color: '#D97706',
  },
  {
    name: 'E-Waste',
    description: 'Outdated or broken electronics, mobile devices, circuit boards, cables, and appliances.',
    icon: 'Cpu',
    disposalInstructions: 'Safely remove batteries when accessible. Clear personal data. Never throw in curbside trash; collected for specialized material recovery.',
    color: '#2563EB',
  },
  {
    name: 'Plastic Waste',
    description: 'Bottles, jugs, rigid plastic containers, and clean consumer packaging (PET, HDPE, PP).',
    icon: 'Sparkles',
    disposalInstructions: 'Check the resin identification code (1–7). Empty and crush bottles to maximize bin capacity. Keep caps attached if specified.',
    color: '#0284C7',
  },
  {
    name: 'Bulky Waste',
    description: 'Large household furniture, mattresses, broken appliances, and oversized equipment.',
    icon: 'Armchair',
    disposalInstructions: 'Dismantle modular furniture if feasible. Place at a clear, unobstructed roadside or ground-floor loading zone on the scheduled day.',
    color: '#7C3AED',
  },
  {
    name: 'Hazardous Waste',
    description: 'Paints, solvents, cleaning chemicals, batteries, motor oils, and fluorescent bulbs.',
    icon: 'AlertTriangle',
    disposalInstructions: 'Keep in original sealed containers with labels visible. Never combine different chemical compounds or discard into municipal water drains.',
    color: '#DC2626',
  },
];

async function main() {
  console.log('Seeding Waste Categories...');

  for (const cat of initialCategories) {
    await prisma.wasteCategory.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
  }

  // Create default admin user
  await prisma.user.upsert({
    where: { email: 'admin@ecocollect.gov' },
    update: {},
    create: {
      email: 'admin@ecocollect.gov',
      name: 'City Waste Dispatcher',
      role: 'ADMIN',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
