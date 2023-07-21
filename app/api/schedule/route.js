import { CronJob } from 'cron';


const jobs = {};


const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://pickleball-reserve-production.up.railway.app/' : 'http://localhost:3000';


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
    jobs[job].stop();
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
  return new Response(JSON.stringify(Object.keys(jobs)), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


export async function POST (request) {
  const data = await request.json();
  const { formData, pattern } = data;
  const wrapper = async () => {await submitForm(formData, formData.date)};
  jobs[formData.date] = new CronJob(pattern, wrapper, null, true, 'America/Chicago');
  return new Response(JSON.stringify(Object.keys(jobs)), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


export async function DELETE (request) {
  const data = await request.json();
  const job = data.job;
  jobs[job].stop();
  delete jobs[job];
  return new Response(JSON.stringify(Object.keys(jobs)), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}