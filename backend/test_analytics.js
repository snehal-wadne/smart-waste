const http = require('http');

http.get('http://localhost:5001/api/admin/analytics', (res) => {
  let body = '';
  res.on('data', (c) => (body += c));
  res.on('end', () => {
    const data = JSON.parse(body);
    console.log('Analytics Success:', data.success);
    console.log('Summary:', data.data.summary);
    console.log('Categories Count:', data.data.categoryDistribution.length);
    console.log('Status Breakdown:', data.data.statusBreakdown);
    console.log('Timeline Points:', data.data.timelineData.length);
  });
}).on('error', console.error);
