const fs = require('fs');


export async function GET() {
  const data = fs.readFileSync('./app/data/test.json', 'utf8');
  const all_keys = JSON.parse(data);
  return new Response(JSON.stringify(all_keys), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}