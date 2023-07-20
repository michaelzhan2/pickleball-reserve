const Redis = require("ioredis");


const redis = new Redis(process.env.REDIS_URL)


async function addJob(job) {
  try {
    await redis.rpush("jobs", job);
    console.log("Job added to redis");
  } catch (err) {
    console.log(err);
  }
}

async function deleteJob(job) {
  try {
    await redis.lrem("jobs", 0, job);
    console.log("Job deleted from redis");
  } catch (err) {
    console.log(err);
  }
}

async function getJobs() {
  try {
    const jobs = await redis.lrange("jobs", 0, -1);
    console.log("Jobs retrieved from redis");
    return jobs;
  } catch (err) {
    console.log(err);
    return [];
  }
}


module.exports = {
  addJob,
  deleteJob,
  getJobs,
};