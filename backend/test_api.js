const http = require('http');

async function testCreate() {
  // 1. Get categories
  const categories = await new Promise((resolve, reject) => {
    http.get('http://localhost:5001/api/waste-categories', (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });

  const category = categories.data[0];
  console.log('Using category:', category.name, category.id);

  // 2. Post request
  const postData = JSON.stringify({
    userName: 'Aarav Sharma',
    userPhone: '9876543210',
    userEmail: 'aarav@example.com',
    address: '42 Green Valley Avenue, Flat 4B',
    city: 'Metro City',
    pickupDate: '2026-09-30',
    pickupTimeSlot: 'Morning (08:00 AM - 11:00 AM)',
    notes: '2 large bags of organic compostable yard trimmings',
    estimatedWeightKg: 15,
    wasteCategoryId: category.id,
  });

  const result = await new Promise((resolve, reject) => {
    const req = http.request(
      'http://localhost:5001/api/collection-requests',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('POST Response status:', result.status);
  console.log('Tracking code generated:', result.body.data.trackingCode);
  console.log('Database request ID:', result.body.data.id);
  console.log('Status:', result.body.data.status);
  console.log('Category name:', result.body.data.wasteCategory.name);

  // 3. Track request
  const trackResult = await new Promise((resolve, reject) => {
    http.get(`http://localhost:5001/api/collection-requests/track/${result.body.data.trackingCode}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });

  console.log('Tracking lookup verified:', trackResult.data.trackingCode === result.body.data.trackingCode);
}

testCreate().catch(console.error);
