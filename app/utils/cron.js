const { CronJob } = require('cron');


async function scheduleForm(formData) {
  await fetch('/api/puppeteer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  scheduleForm.job.stop();
}


async function addData(formData) {
  const data = { 'id': formData.date};
  await fetch('/api/saveData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}


export async function startCron(formData, cronPattern) {
  const wrapper = async () => {await scheduleForm(formData)};
  scheduleForm.job = new CronJob(cronPattern, wrapper, null, true, 'America/Chicago');
  await addData(formData);
  return scheduleForm.job;
}