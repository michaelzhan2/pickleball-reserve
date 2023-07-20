import { getJobs } from 'app/utils/redisClient.js';


export async function GET() {
  const jobs = await getJobs();
  const data = { jobs: jobs }
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}