const cron = require("node-cron");
const { updateStatusProject } = require("./update-status-project");

function scheduleJobs() {
  try {
    // Run every day at 01:00
    cron.schedule("0 0 1 * * *", async () => {
      console.log("CRON JOB RUN AT 01:00 " + new Date());
      await updateStatusProject();
    });
  } catch (error) {
    console.log({
      status: false,
      message: error.message,
      stack: error.stack,
    });
  }
}

module.exports = scheduleJobs;
