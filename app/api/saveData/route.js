import { addJob } from 'app/utils/redisClient.js';


export async function POST(request) {
  const job = await request.json();
  console.log(job);
  await addJob(job);
  return new Response();
}