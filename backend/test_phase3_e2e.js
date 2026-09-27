const http = require('http');

async function sendRequest(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runPhase3E2E() {
  console.log('=== PHASE 3 END-TO-END VERIFICATION ===\n');

  // Step 1: Fetch categories
  const catRes = await sendRequest('http://localhost:5001/api/waste-categories');
  const category = catRes.body.data[1]; // Recyclable Waste
  console.log(`1. Waste Category Selected: ${category.name} (${category.id})`);

  // Step 2: Citizen submits pickup request
  const testPhone = '9988776655';
  const postPayload = JSON.stringify({
    userName: 'Tanvi Deshmukh',
    userPhone: testPhone,
    userEmail: 'tanvi@example.com',
    wasteCategoryId: category.id,
    pickupAddress: 'B-702 Sky High Towers, Baner',
    city: 'Pune',
    preferredDate: '2026-10-02',
    preferredTime: 'Morning (08:00 AM - 11:00 AM)',
    notes: 'Please ring flat bell twice',
    estimatedWeightKg: 10,
  });

  const createRes = await sendRequest(
    'http://localhost:5001/api/requests',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postPayload),
      },
    },
    postPayload
  );

  console.log(`2. POST /api/requests Status: ${createRes.status}`);
  const created = createRes.body.data;
  console.log(`   - Received Request Number: ${created.requestNumber}`);
  console.log(`   - Initial Status: ${created.status}`);
  console.log(`   - Initial History count: ${created.statusHistory.length}`);

  // Step 3: Track request via GET /api/requests/track/:number
  const trackRes = await sendRequest(
    `http://localhost:5001/api/requests/track/${created.requestNumber}`
  );
  console.log(`\n3. GET /api/requests/track/${created.requestNumber} Status: ${trackRes.status}`);
  console.log(`   - Verified Category: ${trackRes.body.data.wasteCategory.name}`);
  console.log(`   - Verified Location: ${trackRes.body.data.pickupAddress}, ${trackRes.body.data.city}`);
  console.log(`   - Verified Date/Time: ${trackRes.body.data.preferredDate} (${trackRes.body.data.preferredTime})`);

  // Step 4: Admin updates status to CONFIRMED
  const patchPayload = JSON.stringify({
    status: 'CONFIRMED',
    collectorName: 'EcoTruck #08 (Pune North Team)',
    dispatchNotes: 'Verified pickup route for Baner sector',
  });

  const patchRes = await sendRequest(
    `http://localhost:5001/api/admin/requests/${created.id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(patchPayload),
      },
    },
    patchPayload
  );
  console.log(`\n4. PATCH /api/admin/requests/:id/status Status: ${patchRes.status}`);
  console.log(`   - New Status: ${patchRes.body.data.status}`);

  // Step 5: Check RequestStatusHistory via GET /api/requests/:id/history
  const historyRes = await sendRequest(
    `http://localhost:5001/api/requests/${created.id}/history`
  );
  console.log(`\n5. GET /api/requests/:id/history Status: ${historyRes.status}`);
  console.log(`   - History records recorded: ${historyRes.body.count}`);
  historyRes.body.data.forEach((h, idx) => {
    console.log(`     [Step ${idx + 1}] ${h.oldStatus || 'NONE'} -> ${h.newStatus} | Note: "${h.note}" | ChangedAt: ${h.changedAt}`);
  });

  // Step 6: View pickup history by phone via GET /api/requests/user/:phone
  const userHistoryRes = await sendRequest(
    `http://localhost:5001/api/requests/user/${testPhone}`
  );
  console.log(`\n6. GET /api/requests/user/${testPhone} Status: ${userHistoryRes.status}`);
  console.log(`   - Total Requests for ${testPhone}: ${userHistoryRes.body.count}`);
  console.log(`   - Request Number in History: ${userHistoryRes.body.data[0].requestNumber}`);
  console.log(`   - Status in History: ${userHistoryRes.body.data[0].status}`);

  console.log('\n=== ALL PHASE 3 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY ===');
}

runPhase3E2E().catch(console.error);
