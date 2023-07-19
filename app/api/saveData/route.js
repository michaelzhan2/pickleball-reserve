const fs = require('fs');

export async function POST(request) {
  const body = await request.json();
  const { id } = body;
  const oldData = fs.readFileSync('./app/data/data.json', 'utf8');
  const parsedData = JSON.parse(oldData);
  parsedData[id] = false;

  fs.writeFileSync('./app/data/data.json', JSON.stringify(parsedData));
  return new Response();
}