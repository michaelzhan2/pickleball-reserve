const { CronJob } = require('cron');


function scheduledFunction() {
  console.log("Running Cron Job");
  // scheduledFunction.job.stop();
}



export async function startCron() {
  scheduledFunction.job = new CronJob('*/5 * * * * *', scheduledFunction);
  scheduledFunction.job.start();
  return scheduledFunction.job;
}


// doesnt work
export async function stopCron(cronJob) {
  console.log("Stopping Cron Job");
  cronJob.stop();
  return new Response();
}