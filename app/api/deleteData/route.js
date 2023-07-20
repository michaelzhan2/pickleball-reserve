import { deleteJob } from 'app/utils/redisClient.js';


export async function DELETE(request) {
  const job = await request.json();
  await deleteJob(job);
  return new Response();
}