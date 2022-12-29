import * as Bull from "bull";

export interface JobFilter {
  name: string;
  filter: (job: Bull.Job, data: any) => boolean;
}

export interface ActionListener {
  filters: Array<JobFilter>;
}

export type ActionEventParam = {};

export interface BlockEventParams extends ActionEventParam {
  blockNumber: number;
}
