const http = require('http');

async function testPhase3() {
  const phone = '9876543210';
  const history = await new Promise((resolve, reject) => {
    http.get(`http://localhost:5001/api/collection-requests/citizen/${phone}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });

  console.log('Citizen requests found:', history.count);
  if (history.data.length > 0) {
    console.log('Sample tracking code:', history.data[0].trackingCode);
    console.log('Status:', history.data[0].status);
    console.log('Category:', history.data[0].wasteCategory.name);
  }
}

testPhase3().catch(console.error);
