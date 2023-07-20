import { deleteJob } from 'app/utils/redisClient.js';


export async function DELETE(request) {
  const job = request.body;
  await deleteJob(job);
  return new Response();
}