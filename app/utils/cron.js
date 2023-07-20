const { CronJob } = require('cron');


async function scheduleForm(formData) {
  console.log('executing scheduleForm')
  await fetch('/api/puppeteer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  scheduleForm.job.stop();
  await fetch('/api/deleteData', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData.date)
  });
}


async function addData(formData) {
  await fetch('/api/saveData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData.date)
  });
}

export async function startCron(formData, cronPattern) {
  const wrapper = async () => {await scheduleForm(formData)};
  scheduleForm.job = new CronJob(cronPattern, wrapper, null, true, 'America/Chicago');
  await addData(formData);
  return scheduleForm.job;
}