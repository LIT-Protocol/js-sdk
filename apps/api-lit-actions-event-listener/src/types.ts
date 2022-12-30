import * as Bull from 'bull';

export interface JobFilter {
  name: string;
  filter: (job: Bull.Job, data: any) => boolean;
}

export interface ActionListener {
  filters: Array<JobFilter>;
  start: any;
  waitingList: Bull.Queue;
  processList: Bull.Queue;
}

export type ActionEventParam = {};

export interface BlockEventParams extends ActionEventParam {
  blockNumber: number;
}
