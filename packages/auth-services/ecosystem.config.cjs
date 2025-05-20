// pm2 list: Show status of all processes.
// pm2 logs pkp-auth-worker: View logs specifically for the workers.
// pm2 logs pkp-auth-api: View logs for the API.
// pm2 restart pkp-auth-worker: Restart all worker instances.
// pm2 scale pkp-auth-worker +2: Scale up the number of worker instances by 2.
// pm2 scale pkp-auth-worker 4: Scale to exactly 4 worker instances.
// pm2 stop all, pm2 delete all
module.exports = {
  apps: [
    {
      name: 'pkp-auth-api',
      script: 'src/server.ts',
      interpreter: 'bun', // Tell PM2 to use bun
      exec_mode: 'fork', // Or 'cluster' if your API server can be clustered
      instances: 1, // Usually 1 instance for the API unless it's designed for clustering
      watch: false, // Or true/paths to watch for auto-restart on file changes (dev)
      env: {
        NODE_ENV: 'development',
        // Add other env vars for the API server here
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pkp-auth-worker',
      script: 'src/services/queue/worker-process.ts',
      interpreter: 'bun', // Tell PM2 to use bun
      exec_mode: 'fork', // Each worker is a separate process
      instances: process.env.NUM_PKP_WORKERS || 2, // Number of worker instances, configurable via env var
      // Or set a fixed number like 4
      watch: false, // Or true/paths for dev
      // Env vars for workers (e.g., WORKER_CONCURRENCY if used by worker-process.ts)
      env: {
        NODE_ENV: 'development',
        WORKER_CONCURRENCY: 5, // This is for the BullMQ internal concurrency per worker process
        // Add other env vars for the worker process here
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_CONCURRENCY: 10,
      },
    },
  ],
};
