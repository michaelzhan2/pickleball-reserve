import { CronJob } from 'cron';
import type { PuppeteerInfo } from '@/types/api';

const jobs: {[key: string]: CronJob} = {};


export async function GET() {
  let responseStatus = 200;

  // return all job IDs
  const ids = Object.keys(jobs);

  return new Response(JSON.stringify(ids), {
    status: responseStatus,
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    }
  });
}


export async function POST(request: Request) {
  let responseBody = 'OK';
  let responseStatus = 200;

  const body: PuppeteerInfo = await request.json();
  const { username, date, month, year, startTime, endTime } = body;
  const id = `${username}-${date}-${month}-${year}-${startTime}-${endTime}`;
  const targetDate: Date = new Date(year, month, date);
  targetDate.setDate(targetDate.getDate() - 2);

  const wrapper = async () => {
    console.log(`[cron] Running job for ${id}`);
    await fetch(process.env.API_URL + '/api/puppeteer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-cache',
    }).then((res) => {
      if (res.status !== 200) {
        console.log(`[cron] Failed job for ${id}`);
        console.log(res.text());
      }

      jobs[id].stop();
      delete jobs[id];
    })
  }

  let pattern = `15 0 6 ${targetDate.getDate()} ${targetDate.getMonth()} *`;
  jobs[id] = new CronJob(pattern, wrapper, null, true, 'America/Chicago');

  console.log(`[cron] Scheduled job for ${id} at ${pattern}`)
  return new Response(responseBody, { status: responseStatus });
}


export async function DELETE(request: Request) {
  let responseBody = 'OK';
  let responseStatus = 200;

  const body = await request.json();
  const { id } = body;
  if (jobs[id]) {
    jobs[id].stop();
    delete jobs[id];
  }
  return new Response(responseBody, { status: responseStatus });
}