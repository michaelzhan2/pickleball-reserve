import { CronJob } from 'cron';
import { create } from 'mathjs';


const jobs = {};


const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://pickleball-reserve-production.up.railway.app/' : 'http://localhost:3000';


function createReturnableObject () {
  const res = {};
  for (const key of Object.keys(jobs)) {
    res[key] = {
      startIdx: jobs[key].formData.startTimeIdxString,
      endIdx: jobs[key].formData.endTimeIdxString
    }
  }
  return res;
}


async function submitForm(formData, job) {
  console.log(`Executing submitForm for ${formData.date} at ${new Date().toLocaleString()}`);
  await fetch (BASE_URL + '/api/puppeteer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    jobs[job].job.stop();
    delete jobs[job];
    if (!response.ok) {
      throw new Error('Puppeteer failed to execute');
    } else {
      console.log(`Successfully executed submitForm for ${formData.date}`);
    }
  })
  .catch(error => {
    console.log(error);
  });  
}


export async function GET () {
  return new Response(JSON.stringify(createReturnableObject()), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


export async function POST (request) {
  const data = await request.json();
  // const { formData, pattern } = data;
  const { formData } = data;

  const currentDateTime = new Date();
  const schedule5MinutesFromNow = new Date(currentDateTime.getTime() + 1 * 60000);
  const newCronPattern = `0 ${schedule5MinutesFromNow.getMinutes()} ${schedule5MinutesFromNow.getHours()} ${schedule5MinutesFromNow.getDate()} ${schedule5MinutesFromNow.getMonth()} *`;
  const pattern = newCronPattern;
  const timezone = 'utc'
  // const timezone = 'America/Chicago'



  const wrapper = async () => {await submitForm(formData, formData.date)};
  jobs[formData.date] = {
    job: new CronJob(pattern, wrapper, null, true, timezone),
    formData: formData
  }
  console.log(`Scheduled job for ${formData.date} at ${new Date().toLocaleString()}`)
  return new Response(JSON.stringify(createReturnableObject()), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


export async function DELETE (request) {
  const data = await request.json();
  const jobName = data.job;
  jobs[jobName].job.stop();
  delete jobs[jobName];
  return new Response(JSON.stringify(createReturnableObject()), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}