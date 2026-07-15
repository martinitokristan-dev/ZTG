const http = require('http');

const data = JSON.stringify({
    name: 'Test',
    part_no: 'test-123',
    category_id: 1,
    stock: 10,
    price1: 100,
    price2: 150,
    status: 'Disabled'
});

const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: '/api/products/1',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Accept': 'application/json'
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
