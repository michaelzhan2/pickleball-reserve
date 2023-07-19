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


export async function startCron(formData, cronPattern) {
  const wrapper = async () => {await scheduleForm(formData)};
  scheduleForm.job = new CronJob(cronPattern, wrapper, null, true, 'America/Chicago');
  return scheduleForm.job;
}