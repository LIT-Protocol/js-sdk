import { t } from 'elysia';

export const getStatusDoc = {
  params: t.Object({
    jobId: t.String({
      description:
        'The ID of the job to check the status for. This ID is returned when a PKP minting request is queued.',
      examples: ['0db70e6c-ad86-47dc-a248-ad118a4a4799'],
    }),
  }),
  detail: {
    summary: 'Get PKP Minting Job Status',
    description:
      'Retrieves the current status and result (if completed) of a PKP minting job previously queued via the /pkp/mint endpoint. Polling this endpoint is necessary to determine the outcome of the asynchronous minting process.',
    tags: ['PKP'],
  },
  response: {
    200: t.Any(),
    500: t.Any(),
  },
};
