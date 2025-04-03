export type PlainJSON =
  | boolean
  | number
  | string
  | { [key: string]: PlainJSON }
  | Array<PlainJSON>;
export type AttenuationsObject = {
  [key: string]: { [key: string]: Array<PlainJSON> };
};
export type CID = string;
