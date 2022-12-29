import Queue from "bull";
import { BlockEventParams } from "../types";
const blockEventWaitingList = new Queue("blockEventWaitingList");

export const mockAddBlockJobs = async (
  blockNumner = 30303490,
  interval = 5000,
  random = 3
) => {
  setInterval(() => {
    // randomize the number of jobs
    let numJobs = Math.floor(Math.random() * random);

    if (numJobs === 0) numJobs = 1;

    console.log(`Adding ${numJobs} jobs`);
    [...new Array(numJobs)].forEach((_, i) => {
      const eventParams: BlockEventParams = {
        blockNumber: blockNumner + i,
      };

      blockEventWaitingList.add({
        payload: {
          name: `test${i}`,
          eventParams,
        },
      });
    });
  }, interval);
};
