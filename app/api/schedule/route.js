import { CronJob } from 'cron';


const jobs = {};


async function submitForm(formData, job) {
  console.log(`Executing submitForm for ${formData.date}`);
  await fetch ('/api/puppeteer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Puppeteer failed to execute');
    }
  })

  jobs[job].stop();
  delete jobs[job];
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