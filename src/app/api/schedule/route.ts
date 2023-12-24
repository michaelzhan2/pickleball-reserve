import { CronJob } from 'cron';
import type { PuppeteerInfo } from '@/types/api';


const jobs: {[key: string]: CronJob} = {};
const scheduledDates: string[] = [];


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
  const shortId = `${username}-${date}-${month}-${year}`;
  if (scheduledDates.includes(shortId)) {
    responseBody = 'Already scheduled for this date';
    responseStatus = 403;
    return new Response(responseBody, { status: responseStatus });
  }

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
      console.log(`[cron] Finished and deleting job for ${id}`)
      jobs[id].stop();
      delete jobs[id];
    })
  }

  // let pattern = `15 0 6 ${targetDate.getDate()} ${targetDate.getMonth()} *`;
  let test = new Date();
  test.setSeconds(test.getSeconds() + 5);
  let pattern = `${test.getSeconds()} ${test.getMinutes()} ${test.getHours()} ${test.getDate()} ${test.getMonth() + 1} *`;
  jobs[id] = new CronJob(pattern, wrapper, null, true, 'America/Chicago');
  scheduledDates.push(shortId);

  console.log(`[cron] Scheduled job for ${id} at ${pattern}`)
  return new Response(responseBody, { status: responseStatus });
}


export async function DELETE(request: Request) {
  let responseBody = 'OK';
  let responseStatus = 200;

  const body = await request.json();
  const { id } = body;
  const shortId: string = id.split('-').slice(0, 4).join('-');
  if (jobs[id]) {
    jobs[id].stop();
    delete jobs[id];
    scheduledDates.splice(scheduledDates.indexOf(shortId), 1);
    console.log(`[cron] Deleted job for ${id}`)
  }
  return new Response(responseBody, { status: responseStatus });
}