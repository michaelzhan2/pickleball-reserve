import { getFromRedis, addToRedis } from 'app/utils/redisClient.js';


export async function POST(request) {
  try {
    const data = await getFromRedis('jobs');
    const body = await request.json();
    const { id } = body;
    data += `#${id}`
    await addToRedis('jobs', data);
    return new Response();
  } catch (err) {
    console.log(err);
  }
}