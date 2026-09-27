const http = require('http');

async function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testAdmin() {
  console.log('Testing Admin Endpoints...');

  // 1. Get all requests
  const listRes = await request('http://localhost:5001/api/admin/requests');
  console.log('Admin list count:', listRes.body.count, 'Total:', listRes.body.total);
  const targetReq = listRes.body.data[0];

  if (!targetReq) {
    console.log('No request found to update');
    return;
  }

  console.log('Target request ID:', targetReq.id, 'Current status:', targetReq.status);

  // 2. Patch status to CONFIRMED with collectorName
  const patchData = JSON.stringify({
    status: 'CONFIRMED',
    collectorName: 'EcoTruck #04 (Driver: Vikram)',
    dispatchNotes: 'Priority pickup scheduled for sector 4',
  });

  const patchRes = await request(
    `http://localhost:5001/api/admin/requests/${targetReq.id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(patchData),
      },
    },
    patchData
  );

  console.log('PATCH Status response:', patchRes.status, 'New status:', patchRes.body.data.status);
  console.log('Assigned Collector:', patchRes.body.data.collectorName);

  // 3. Check stats
  const statsRes = await request('http://localhost:5001/api/admin/stats');
  console.log('Admin Stats:', statsRes.body.data);
}

testAdmin().catch(console.error);
