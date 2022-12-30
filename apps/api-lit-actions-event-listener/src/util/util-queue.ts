import * as Bull from "bull";
import { Log } from "./util-log";

export const moveQueue = async ({
  from,
  to,
  type,
  debug = false,
  filter,
}: {
  from: Bull.Queue;
  to: Bull.Queue;
  type: Bull.JobStatus;
  debug?: boolean;
  filter?: (job: Bull.Job, data: any) => boolean;
}) => {
  let jobs: Array<Bull.Job> = [];

  if (!type) {
    throw new Error("type is required");
  }

  if (type === "waiting") {
    jobs = await from.getWaiting();
  }

  if (type === "active") {
    jobs = await from.getActive();
  }

  if (type === "completed") {
    jobs = await from.getCompleted();
  }

  if (type === "failed") {
    jobs = await from.getFailed();
  }

  if (type === "delayed") {
    jobs = await from.getDelayed();
  }

  if (filter) {
    try {
      jobs = jobs.filter(filter);
    } catch (e) {
      console.log(e.message);
      // swallow error
    }
  }

  // do a async for each
  jobs.forEach(async (job: Bull.Job) => {
    if (debug) {
      Log.info(`[MoveQueue] ...adding ${JSON.stringify(job.data)}`);
    }

    to.add(job.data);

    try {
      const waitingJob = await from.getJob(job.id);
      waitingJob.remove();
    } catch (e) {
      // swallow error
    }
  });

  Log.info(`[MoveQueue] moved ${jobs.length} jobs from ${from.name} to ${to.name}`);
};
