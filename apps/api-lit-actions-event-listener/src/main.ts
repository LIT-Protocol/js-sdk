import Queue from "bull";
import { BlockListener } from "./listeners/block-listener";
import { mockAddBlockJobs } from "./mock/mock-add-block-jobs";
import { Log } from "./util/util-log";
import { moveQueue } from "./util/util-queue";

const blockEventWaitingList = new Queue("blockEventWaitingList");
const blockEventProcessingList = new Queue("blockEventProcessingList");

// ---------------------------------
//          configuration
// ---------------------------------
const CONFIG = {
  THREAD: 1,
};

// init
const blockListener = new BlockListener();

let blockEventProcessStarted = false;

blockListener.provider.on("block", async (blockNumber) => {
  // -- don't process if already processing
  if (blockEventProcessStarted) return;
  blockEventProcessStarted = true;

  // -- get all waiting jobs
  let waitingJobs = await blockEventWaitingList.getWaiting();

  // -- filter jobs
  let filterdJobs = waitingJobs.filter((job) =>
    blockListener.getFilter("lessThanOrEqual")(job, { blockNumber })
  );

  Log.warning(`Filterd jobs: ${filterdJobs.length}`);

  // -- log it
  Log.info(
    `event:BlockEvent, block:${blockNumber}, waiting:${waitingJobs.length}, filtered:${filterdJobs.length}`
  );

  // -- move all waiting jobs to processing list
  await moveQueue({
    type: "waiting",
    from: blockEventWaitingList,
    to: blockEventProcessingList,
    filter: (job) =>
      blockListener.getFilter("lessThanOrEqual")(job, { blockNumber }),
    debug: true,
  });

  // -- start processing
  blockEventProcessStarted = false;
});

blockEventProcessingList.process(CONFIG.THREAD, function (job, done) {
  Log.info(`processing job ${job.id}: ${JSON.stringify(job.data)}`);
  done(); 
});

// // blockEventWaitingList.process(10, function (job, done) {
// //   console.log("processing job", job.data);
// //   done();
// // });

mockAddBlockJobs(30304200, 5000, 10);
