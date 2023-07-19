const fs = require('fs');
const process = require('process');

export async function GET() {
  const data = JSON.stringify({
    "username": "test",
    "password": "test",
  })
  fs.writeFileSync('./app/data/test.json', data);
  return new Response();
}