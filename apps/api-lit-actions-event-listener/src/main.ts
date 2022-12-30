import Queue from 'bull';

import { BlockListener } from './listeners/block-listener';
import { mockAddBlockJobs } from './mock/mock-add-block-jobs';

const blockListener = new BlockListener({
  waitingList: new Queue('blockEventWaitingList'),
  processList: new Queue('blockEventProcessingList'),
});

blockListener.start({
    beforeEnd: () => {
        mockAddBlockJobs(30304200, 5000, 10);
    }
});