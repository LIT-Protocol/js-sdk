import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    GH_API_KEY: z.string().min(1, 'GitHub API token is required'),
    DEV_BRANCH: z.string().min(1, 'Development branch name is required'),
  },
  runtimeEnv: process.env,
});
