// TODO: We should fix this to make it work! This is working in recap-session-capability-object.ts
// EDIT: when this is used in litNodeClientNodejs "generateSessionCapabilityObjectWithWildcards" function, it has the same error.
// import { IPFSBundledSDK } from "./ipfs-bundled-sdk";

// export async function strToCID(data: string | Uint8Array | object): Promise<string> {
//   let content: Uint8Array;

//   // Check the type of data and convert accordingly
//   if (typeof data === 'string') {
//     // console.log("Type A");
//     // Encode the string directly if data is a string
//     content = new TextEncoder().encode(data);
//   } else if (data instanceof Uint8Array) {
//     // console.log("Type B");
//     // Use the Uint8Array directly
//     content = data;
//   } else if (typeof data === 'object') {
//     // console.log("Type C");
//     // Stringify and encode if data is an object
//     const contentStr = JSON.stringify(data);
//     content = new TextEncoder().encode(contentStr);
//   } else {
//     console.log("Type D");
//     throw new Error("Invalid content type");
//   }

//   // Create the CID
//   let ipfsId;
//   for await (const { cid } of IPFSBundledSDK.importer(
//     [{ content }],
//     new IPFSBundledSDK.MemoryBlockstore(),
//     { onlyHash: true }
//   )) {
//     ipfsId = cid;
//   }

//   // Validate the IPFS ID
//   if (!ipfsId) {
//     throw new Error("Could not create IPFS ID");
//   }

//   // Return the IPFS ID as a string
//   return ipfsId.toString();
// }