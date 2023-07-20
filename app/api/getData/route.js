import { getJobs } from 'app/utils/redisClient.js';


export async function GET() {
  const jobs = await getJobs();
  return new Response(JSON.stringify(jobs), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}