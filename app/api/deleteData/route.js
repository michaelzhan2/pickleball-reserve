import { deleteJob } from 'app/utils/redisClient.js';


export async function DELETE(request) {
  const data = await request.json();
  const job = data.body;
  await deleteJob(job);
  return new Response();
}