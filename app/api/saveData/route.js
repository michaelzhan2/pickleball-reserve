import { addJob } from 'app/utils/redisClient.js';


export async function POST(request) {
  const job = request.body;
  await addJob(job);
  return new Response();
}