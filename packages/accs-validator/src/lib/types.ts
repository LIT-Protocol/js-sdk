export type AccsValidatorStatus = {
  status: 500 | 200;
  msg: string;
};

export interface AccsValidatePassed extends AccsValidatorStatus {
  status: 200;
  msg: string;
  data?: any;
}

export interface AccsValidateFailed extends AccsValidatorStatus {
  status: 500;
  msg: string;
}

export type AccsSchema = {
  $id: string;
  $schema: string;
  title: string;
  description: string;
  type: string;
  properties: any;
  required: string[];
};
