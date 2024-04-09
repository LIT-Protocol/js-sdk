import { AuthSig, LitResourceAbilityRequest } from './models';

export function humanizedSiweSignedMessage(signedMessage: string) {
  let report = ''; // Initialize an empty string to accumulate the report

  try {
    const sessionSig = JSON.parse(signedMessage);

    if (sessionSig.sessionKey) {
      report += `\x1b[36mSession Key: ${sessionSig.sessionKey}\x1b[0m\n`;

      if (sessionSig.resourceAbilityRequests) {
        sessionSig.resourceAbilityRequests.forEach(
          (request: LitResourceAbilityRequest, index: number) => {
            report += `\x1b[33mResourceAbilityRequest #${index + 1}:\x1b[0m\n`;
            report += `  Resource: ${request.resource.resource}\n`;
            report += `  Resource Prefix: ${request.resource.resourcePrefix}\n`;
            report += `  Ability: ${request.ability}\n`;
          }
        );
      }

      if (sessionSig.capabilities) {
        sessionSig.capabilities.forEach((capability: AuthSig, index: any) => {
          report += `\x1b[32mCapability #${index + 1}:\x1b[0m\n`;
          report += `  Sig: ${capability.sig}\n`;
          report += `  Derived Via: ${capability.derivedVia}\n`;
          report += `  Address: ${capability.address}\n`;

          const signedMessageDetails: any =
            capability.signedMessage.split('\n');

          report += `  ❗️ Signed Message Details:\n`;

          try {
            const ethereumAccountAddress = signedMessageDetails.find(
              (line: string) => line.startsWith('0x')
            );
            const uri = signedMessageDetails
              .find((line: string) => line.startsWith('URI:'))
              .replace('URI: ', '');
            const resources = signedMessageDetails
              .find((line: string) => line.startsWith('- urn:recap:'))
              .replace('- urn:recap:', '')
              .trim();

            const decodedResources = JSON.parse(atob(resources));

            // Extract session key from URI and compare
            // const uriSessionKey = uri.split(':')[2];
            // const sessionKeyMatch = uriSessionKey === sessionSig.sessionKey ? "Yes" : "No";

            report += `     Ethereum Account Address: ${ethereumAccountAddress}\n`;
            report += `\x1b[36m     URI: ${uri}\x1b[0m\n`;
            // report += `    Session Key Matches URI: ${sessionKeyMatch}\n`;
            report += `     Resources: ${JSON.stringify(decodedResources)}\n`;
          } catch (e) {
            report += `     Error parsing, but here's the signedMessageDetails:\n`;
            report += `     ${signedMessageDetails}\n`;
          }
        });
      }
    } else {
      report += "It's a regular signed message.\n";
    }
  } catch (e: any) {
    report += `Error parsing the signed message: ${e.message}\n`;
  }

  return report;
}

export function getSessionSigReport(sessionSig: any) {
  let report = '\n=========== 📝 Human-readable session sig 📝 ===========\n\n';
  report += `Sig: ${sessionSig.sig}\n`;
  report += `Derived Via: ${sessionSig.derivedVia}\n`;
  report += `\x1b[36mAddress: ${sessionSig.address}\x1b[0m\n`;
  report += `Algo: ${sessionSig.algo}\n\n`;
  report += `❗️ Signed Message Report:\n`;
  report += humanizedSiweSignedMessage(sessionSig.signedMessage);
  report +=
    '\n=========== 📝 Human-readable session sig completed 📝 ===========\n';

  return report;
}

// Example of using the function
// const report = humanizedSiweSignedMessage(sessionSigSignedMessage);
// console.log(report);\
