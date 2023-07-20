import { addJob } from 'app/utils/redisClient.js';


export async function POST(request) {
  const data = await request.json();
  const job = data.body;
  await addJob(job);
  return new Response();
}