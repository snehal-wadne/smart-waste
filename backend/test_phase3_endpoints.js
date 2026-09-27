const http = require('http');

async function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5001${path}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    }).on('error', reject);
  });
}

async function testEndpoints() {
  console.log('Testing Phase 3 Backend Endpoints...');

  // 1. GET /api/requests/track/:number
  const trackRes = await get('/api/requests/track/WC-2026-0007');
  console.log('Track WC-2026-0007 Status:', trackRes.status);
  console.log('Request Number:', trackRes.data.data.requestNumber);
  console.log('Category:', trackRes.data.data.wasteCategory.name);
  console.log('Status History count:', trackRes.data.data.statusHistory.length);

  // 2. GET /api/requests/user/:phone
  const userRes = await get('/api/requests/user/9876543210');
  console.log('User 9876543210 Status:', userRes.status);
  console.log('Requests for phone:', userRes.data.count);

  // 3. GET /api/requests/:id/history
  const historyRes = await get(`/api/requests/${trackRes.data.data.id}/history`);
  console.log('Request history Status:', historyRes.status);
  console.log('History entries:', historyRes.data.count);
  console.log('First history entry:', historyRes.data.data[0]);
}

testEndpoints().catch(console.error);
