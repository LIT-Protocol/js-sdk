// TODO: We should fix this to make it work! This is working in recap-session-capability-object.ts
// EDIT: when this is used in litNodeClientNodejs "generateSessionCapabilityObjectWithWildcards" function, it has the same error.

// import { strToCID } from "./utils";

// describe('strToCID', () => {
//   it('should handle string input', async () => {
//     const input = "Hello, world!";
//     const result = await strToCID(input);
//     expect(result).toBe('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks');
//   });

//   it('should handle Uint8Array input', async () => {
//     const input = new TextEncoder().encode("Hello, world!");
//     const result = await strToCID(input);
//     expect(result).toBe('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks');
//   });

//   it('should handle object input', async () => {
//     const input = { message: "Hello, world!" };
//     const result = await strToCID(input);
//     expect(result).toBe('QmTR2kDqux4yo5X9W6GKJKEn6azDqXqifRMGYtX27oAQLk');
//   });
// });