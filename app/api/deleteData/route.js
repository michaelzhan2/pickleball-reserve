import { deleteFromRedis } from "app/utils/redisClient";


export async function DELETE(request) {
  const data = fs.readFileSync('./app/data/data.json', 'utf8');
  const all_keys = JSON.parse(data);

  const body = await request.json();
  const { id } = body;
  delete all_keys[id];
  fs.writeFileSync('./app/data/data.json', JSON.stringify(all_keys));
  return new Response(JSON.stringify(all_keys), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}