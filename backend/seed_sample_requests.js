const prisma = require('./src/prisma');

async function seedSampleRequests() {
  console.log('Seeding sample civic collection requests with status histories...');

  const categories = await prisma.wasteCategory.findMany();
  if (categories.length === 0) return;

  const catMap = {};
  categories.forEach((c) => (catMap[c.name] = c.id));

  const sampleData = [
    {
      requestNumber: 'WC-2026-0001',
      trackingCode: 'WC-2026-0001',
      userName: 'Aarav Sharma',
      userPhone: '9876543210',
      userEmail: 'aarav.sharma@example.com',
      pickupAddress: '42 Green Valley Avenue, Flat 4B',
      city: 'Pune',
      preferredDate: '24 Sept 2026',
      preferredTime: 'Morning (08:00 AM - 11:00 AM)',
      notes: 'Separated organic kitchen compost and garden leaves',
      estimatedWeightKg: 12.5,
      status: 'COLLECTED',
      collectorName: 'EcoTruck #01 (Driver: Ramesh)',
      dispatchNotes: 'Composted at municipal bio-facility',
      wasteCategoryId: catMap['Organic Waste'] || categories[0].id,
      history: [
        { oldStatus: null, newStatus: 'PENDING', note: 'Request submitted by citizen', timeOffset: -3600 * 48 },
        { oldStatus: 'PENDING', newStatus: 'CONFIRMED', note: 'Municipal dispatch verified slot', timeOffset: -3600 * 36 },
        { oldStatus: 'CONFIRMED', newStatus: 'ASSIGNED', note: 'EcoTruck #01 dispatched', timeOffset: -3600 * 12 },
        { oldStatus: 'ASSIGNED', newStatus: 'COLLECTED', note: 'Successfully collected and weighed (12.5 kg)', timeOffset: -3600 * 4 },
      ],
    },
    {
      requestNumber: 'WC-2026-0007',
      trackingCode: 'WC-2026-0007',
      userName: 'Aarav Sharma',
      userPhone: '9876543210',
      userEmail: 'aarav.sharma@example.com',
      pickupAddress: 'Model Colony, Shivajinagar',
      city: 'Pune',
      preferredDate: '24 Sept 2026',
      preferredTime: 'Afternoon (12:00 PM - 03:00 PM)',
      notes: 'Clean beverage cans, metal tins, and containers',
      estimatedWeightKg: 8.0,
      status: 'COLLECTED',
      collectorName: 'EcoVan #03 (Driver: Salim)',
      dispatchNotes: 'Delivered to urban recycling depot',
      wasteCategoryId: catMap['Recyclable Waste'] || categories[1].id,
      history: [
        { oldStatus: null, newStatus: 'PENDING', note: 'Request submitted by citizen', timeOffset: -3600 * 30 },
        { oldStatus: 'PENDING', newStatus: 'CONFIRMED', note: 'Pickup slot confirmed', timeOffset: -3600 * 20 },
        { oldStatus: 'CONFIRMED', newStatus: 'ASSIGNED', note: 'EcoVan #03 assigned to route', timeOffset: -3600 * 8 },
        { oldStatus: 'ASSIGNED', newStatus: 'COLLECTED', note: 'Waste collected and transferred to recycling depot', timeOffset: -3600 * 2 },
      ],
    },
    {
      requestNumber: 'WC-2026-0012',
      trackingCode: 'WC-2026-0012',
      userName: 'Neha Singhania',
      userPhone: '9812345678',
      userEmail: 'neha.s@example.com',
      pickupAddress: '15 Lotus Boulevard, Block C',
      city: 'Pune',
      preferredDate: '28 Sept 2026',
      preferredTime: 'Morning (08:00 AM - 11:00 AM)',
      notes: 'Flattened amazon boxes and clean newsprint bundles',
      estimatedWeightKg: 14.0,
      status: 'ASSIGNED',
      collectorName: 'EcoTruck #05 (Driver: Vikram)',
      dispatchNotes: 'In transit to locality',
      wasteCategoryId: catMap['Paper & Cardboard'] || categories[2].id,
      history: [
        { oldStatus: null, newStatus: 'PENDING', note: 'Request submitted by citizen', timeOffset: -3600 * 24 },
        { oldStatus: 'PENDING', newStatus: 'CONFIRMED', note: 'Schedule confirmed by city dispatch', timeOffset: -3600 * 14 },
        { oldStatus: 'CONFIRMED', newStatus: 'ASSIGNED', note: 'EcoTruck #05 assigned for morning run', timeOffset: -3600 * 3 },
      ],
    },
    {
      requestNumber: 'WC-2026-0018',
      trackingCode: 'WC-2026-0018',
      userName: 'Rajesh Kothari',
      userPhone: '9765432190',
      userEmail: 'rajesh.k@example.com',
      pickupAddress: '88 Tech Park View, Phase 2',
      city: 'Pune',
      preferredDate: '29 Sept 2026',
      preferredTime: 'Morning (08:00 AM - 11:00 AM)',
      notes: '2 broken laptops, old microwave, chargers, circuit boards',
      estimatedWeightKg: 16.0,
      status: 'CONFIRMED',
      collectorName: 'Specialized E-Waste Squad',
      dispatchNotes: 'Awaiting route dispatch on scheduled day',
      wasteCategoryId: catMap['E-Waste'] || categories[3].id,
      history: [
        { oldStatus: null, newStatus: 'PENDING', note: 'Request submitted by citizen', timeOffset: -3600 * 16 },
        { oldStatus: 'PENDING', newStatus: 'CONFIRMED', note: 'Schedule confirmed by dispatch', timeOffset: -3600 * 6 },
      ],
    },
    {
      requestNumber: 'WC-2026-0025',
      trackingCode: 'WC-2026-0025',
      userName: 'Dr. Kavita Verma',
      userPhone: '9845012345',
      userEmail: 'dr.kavita@healthclinic.org',
      pickupAddress: '7 Medical Enclave, Sector 12',
      city: 'Pune',
      preferredDate: '30 Sept 2026',
      preferredTime: 'Evening (04:00 PM - 07:00 PM)',
      notes: 'Expired household disinfectants and lead paints',
      estimatedWeightKg: 6.5,
      status: 'PENDING',
      collectorName: null,
      dispatchNotes: null,
      wasteCategoryId: catMap['Hazardous Waste'] || categories[4].id,
      history: [
        { oldStatus: null, newStatus: 'PENDING', note: 'Request submitted by citizen', timeOffset: -3600 * 2 },
      ],
    },
  ];

  for (const item of sampleData) {
    const { history, ...reqData } = item;
    const created = await prisma.collectionRequest.upsert({
      where: { requestNumber: reqData.requestNumber },
      update: reqData,
      create: reqData,
    });

    // Seed status history for each request
    await prisma.requestStatusHistory.deleteMany({ where: { requestId: created.id } });
    for (const h of history) {
      const changedAt = new Date(Date.now() + (h.timeOffset || 0) * 1000);
      await prisma.requestStatusHistory.create({
        data: {
          requestId: created.id,
          oldStatus: h.oldStatus,
          newStatus: h.newStatus,
          note: h.note,
          changedAt,
        },
      });
    }
  }

  console.log(`Seeded ${sampleData.length} requests with complete status history timelines!`);
}

seedSampleRequests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
