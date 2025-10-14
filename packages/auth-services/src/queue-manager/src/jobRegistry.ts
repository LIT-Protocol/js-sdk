import { handlePkpMintTask } from './handlers'; // This imports from ./handlers/index.ts

export const JOBS = ['pkpMint'] as const;

export type JobName = typeof JOBS[number];

/**
 * Registry of job names to their handler functions.
 * The job name string used when adding a job to the queue (e.g., 'pkpMint' in server.ts)
 * must match a key in this object. The value associated with the key is the
 * actual handler function that will be invoked by the generic worker to process the job.
 */
export const jobRegistry: Record<JobName, (jobData: any) => Promise<any>> = {
  pkpMint: handlePkpMintTask,
  // ... add more jobs here
};
