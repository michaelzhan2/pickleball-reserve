import { CronJob } from 'cron';
import type { PuppeteerInfo } from '@/types/api';


const allIds: string[] = [];
const cronJobs: {[key: string]: CronJob} = {};          // date -> job
const jobLists: {[key: string]: PuppeteerInfo[]} = {};  // date -> list of puppeteer information
const scheduledDates: string[] = [];


// get all scheduled IDs
export async function GET() {
  let responseStatus = 200;

  return new Response(JSON.stringify(allIds), {
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
  const dateString = `${date}-${month}-${year}`;
  if (scheduledDates.includes(shortId)) {
    responseBody = 'Already scheduled on this account for this date';
    responseStatus = 403;
    return new Response(responseBody, { status: responseStatus });
  }

  const targetDate: Date = new Date(year, month, date);
  targetDate.setDate(targetDate.getDate() - 2);

  const wrapper = async () => {
    jobLists[dateString].forEach(async (body: PuppeteerInfo) => {
      const id = `${body.username}-${body.date}-${body.month}-${body.year}-${body.startTime}-${body.endTime}`;
      const shortId = `${body.username}-${body.date}-${body.month}-${body.year}`;
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
        allIds.splice(allIds.indexOf(id), 1);
        scheduledDates.splice(scheduledDates.indexOf(shortId), 1);
      })
    })
    delete jobLists[dateString];
    cronJobs[dateString].stop();
    delete cronJobs[dateString];
  }

  let pattern = `10 0 6 ${targetDate.getDate()} ${targetDate.getMonth() + 1} *`;
  allIds.push(id);
  if (cronJobs[dateString] === undefined) {
    cronJobs[dateString] = new CronJob(pattern, wrapper, null, true, 'America/Chicago');
  }
  if (!jobLists[dateString]) {
    jobLists[dateString] = [];
  }
  jobLists[dateString].push(body);
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
  const dateString: string = id.split('-').slice(1, 4).join('-');

  jobLists[dateString].splice(jobLists[dateString].indexOf(id), 1);
  allIds.splice(allIds.indexOf(id), 1);
  if (jobLists[dateString].length === 0) {
    cronJobs[dateString].stop();
    delete cronJobs[dateString];
    delete jobLists[dateString];
  }
  scheduledDates.splice(scheduledDates.indexOf(shortId), 1);
  console.log(`[cron] Deleted job for ${id}`)
  return new Response(responseBody, { status: responseStatus });
}