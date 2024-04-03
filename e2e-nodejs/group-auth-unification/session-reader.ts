import * as nodeData from './data/lit-nodes-output-session-sig';
import * as SDKData from './data/sdk-output-session-sig';
import * as testData1 from './data/test-output-session-sig-1';

import * as fs from 'fs';

// Function to determine which data to use based on a command line argument
function getSessionSigData(dataSource: string) {
  if (dataSource === 'node') {
    return nodeData.__dataSessionSig;
  } else if (dataSource === 'sdk') {
    return SDKData.__dataSessionSig;
  } else if (dataSource === 'test1') {
    return testData1.__dataSessionSig;
  } else {
    throw new Error('Invalid data source specified. Use "node" or "sdk".');
  }
}

// Extracting the data source from command line arguments
const dataSource = process.argv[2]; // node script.mjs [node|sdk]

// Using the function to get the appropriate data
const sessionSig = getSessionSigData(dataSource) as any;

console.log("sessionSig.signedMessage:", sessionSig.signedMessage);

const sessionSigSignedMessage = JSON.parse(
  sessionSig.signed_message ?? sessionSig.signedMessage
);

function formatAuthorizedActions(input: string): string {
  // Define a regular expression to match the action authorization statements
  const actionRegex =
    /I further authorize the stated URI to perform the following actions on my behalf: (.+?)(?=I further authorize|\n\nURI:|$)/gs;

  let formattedActions = '\n';
  const matches = [...input.matchAll(actionRegex)];

  // Process each match
  matches.forEach((match, index) => {
    formattedActions += `   👍 [${index + 1
      }] Authorized actions to be performed on my behalf:\n   ---------\n`;
    // Split the actions by period for individual lines, filter out empty lines
    const actions = match[1]
      .trim()
      .split('.')
      .filter((action) => action.trim().length > 0);
    actions.forEach((action, actionIndex) => {
      formattedActions += `    ${actionIndex + 1}. ${action.trim()}.\n`;
    });
    formattedActions += '\n'; // Add a blank line for readability
  });

  const versionIndex = formattedActions.indexOf('Version: 1');
  if (versionIndex !== -1) {
    formattedActions = formattedActions.substring(0, versionIndex).trim();
  }

  // remove extra new lines at the end
  formattedActions = formattedActions.trim();

  return formattedActions;
}

function extractRecapResources(input: string): string[] {
  // Define a regular expression to find the "Resources" section and capture urn:recap strings
  const resourceRegex = /urn:recap:[^\s]+/g;

  // Extract all matches for urn:recap strings
  const matches = input.match(resourceRegex);

  // If there are no matches, return an empty array
  if (!matches) {
    return [];
  }

  // Return the array of captured urn:recap strings
  return matches;
}

function formatUrnRecap(input: string): string {
  // Split the URN by colon
  const parts = input.split(':');

  const base64 = parts[2];

  // decode base64
  const buff = Buffer.from(base64, 'base64');
  const decoded = buff.toString('ascii');
  const decodedJson = JSON.parse(decoded);

  return JSON.stringify(decodedJson, null, 2);
}

// -- session sig is requestsing the following resource abilities
const print = `❗️ SessionSig Signed Message Information:
--------------------------------
🔑 Session Key: ${sessionSigSignedMessage.sessionKey}
${sessionSigSignedMessage.resourceAbilityRequests
    .map((r) => {
      return `✅ Resource: "${r.resource.resourcePrefix}://${r.resource.resource}" with the ability of "${r.ability}"`;
    })
    .join('\n')}
✅ Capabilities | found (${sessionSigSignedMessage.capabilities.length})
${sessionSigSignedMessage.capabilities.map((c, i) => {
      return `❗️ [${i + 1}] Capability Signed Message Information
   --------------------------------
   ${formatAuthorizedActions(c.signedMessage)}

   ✅ Resources (from Recap URNs) | found (${extractRecapResources(c.signedMessage).length
        }):
   --------------------------------
   ${extractRecapResources(c.signedMessage).map((r, i) => {
          return `   [${i + 1}]\n${formatUrnRecap(r)}`;
        })}
   `;
    })}
`;

console.log(print);

// -- write to file
// const filename = `${dataSource}-session-sig-info-${Date.now()}.txt`;
const filename = `${dataSource}-session-sig-info.txt`;
fs.writeFileSync(filename, print);
