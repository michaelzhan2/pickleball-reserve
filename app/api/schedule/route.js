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
  console.log(`Executing submitForm for ${formData.date}`);
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
  const { formData, pattern } = data;
  const wrapper = async () => {await submitForm(formData, formData.date)};
  jobs[formData.date] = {
    job: new CronJob(pattern, wrapper, null, true, 'America/Chicago'),
    formData: formData
  }
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