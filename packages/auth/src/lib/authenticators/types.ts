// Interface for the job status response
export interface JobStatusResponse {
  jobId: string;
  name: string;
  state:
    | 'pending'
    | 'active'
    | 'completed'
    | 'failed'
    | 'delayed'
    | 'waiting'
    | 'error'
    | 'unknown'; // Added 'error' based on potential states
  progress: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  returnValue?: any;
  error?: any; // To capture any error messages from the job itself
}
