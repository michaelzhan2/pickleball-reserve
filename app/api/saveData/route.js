const fs = require('fs');

export async function POST(request) {
  const body = await request.json();
  const { id } = body;
  const oldData = fs.readFileSync('./app/data/test.json', 'utf8');
  const parsedData = JSON.parse(oldData);
  console.log(id);
  parsedData[id] = false;

  fs.writeFileSync('./app/data/test.json', JSON.stringify(parsedData));
  return new Response();
}