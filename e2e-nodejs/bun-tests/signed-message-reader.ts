export function getSignedMessageReport(signedMessage: string) {
  let report = ""; // Initialize an empty string to accumulate the report

  try {
    const sessionSig = JSON.parse(signedMessage);

    if (sessionSig.sessionKey) {
      report += `\x1b[36mSession Key: ${sessionSig.sessionKey}\x1b[0m\n`;

      if (sessionSig.resourceAbilityRequests) {
        sessionSig.resourceAbilityRequests.forEach((request, index) => {
          report += `\x1b[33mResourceAbilityRequest #${index + 1}:\x1b[0m\n`;
          report += `  Resource: ${request.resource.resource}\n`;
          report += `  Resource Prefix: ${request.resource.resourcePrefix}\n`;
          report += `  Ability: ${request.ability}\n`;
        });
      }

      if (sessionSig.capabilities) {
        sessionSig.capabilities.forEach((capability, index) => {
          report += `\x1b[32mCapability #${index + 1}:\x1b[0m\n`;
          report += `  Sig: ${capability.sig}\n`;
          report += `  Derived Via: ${capability.derivedVia}\n`;
          report += `  Address: ${capability.address}\n`;

          const signedMessageDetails = capability.signedMessage.split('\n');
          const ethereumAccountAddress = signedMessageDetails.find(line => line.startsWith('0x'));
          const uri = signedMessageDetails.find(line => line.startsWith('URI:')).replace('URI: ', '');
          const resources = signedMessageDetails.find(line => line.startsWith('- urn:recap:')).replace('- urn:recap:', '').trim();
          const decodedResources = JSON.parse(atob(resources));

          // Extract session key from URI and compare
          // const uriSessionKey = uri.split(':')[2];
          // const sessionKeyMatch = uriSessionKey === sessionSig.sessionKey ? "Yes" : "No";

          report += `  ❗️ Signed Message Details:\n`;
          report += `     Ethereum Account Address: ${ethereumAccountAddress}\n`;
          report += `\x1b[36m     URI: ${uri}\x1b[0m\n`;
          // report += `    Session Key Matches URI: ${sessionKeyMatch}\n`;
          report += `     Resources: ${JSON.stringify(decodedResources)}\n`;
        });
      }
    } else {
      report += "It's a regular signed message.\n";
    }
  } catch (e) {
    report += `Error parsing the signed message: ${e.message}\n`;
  }

  return report;
}

export function getSessionSigReport(sessionSig) {
  let report = "\n=========== 📝 Session Sig Report ===========\n";
  report += `Sig: ${sessionSig.sig}\n`;
  report += `Derived Via: ${sessionSig.derivedVia}\n`;
  report += `\x1b[36mAddress: ${sessionSig.address}\x1b[0m\n`;
  report += `Algo: ${sessionSig.algo}\n\n`;
  report += `❗️ Signed Message Report:\n`;
  report += getSignedMessageReport(sessionSig.signedMessage);

  return report;
}

// Example of using the function
// const report = getSignedMessageReport(sessionSigSignedMessage);
// console.log(report);
