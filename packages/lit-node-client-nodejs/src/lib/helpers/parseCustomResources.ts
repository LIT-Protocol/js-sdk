export function parseCustomResources(nodeResponses: any) {
  return ((nodeResponses.values.map((item: any) => {
    return {
      signedMessage: item.siweMessage
    };
  }).map((v: any, i: number) => {
    const signedMessage = v.signedMessage;
    const urnLine = signedMessage.match(/urn:recap:[\w\d]+/)![0];

    const authContext = JSON.parse(atob(urnLine.split(':')[2])).att['lit-resolvedauthcontext://*']['Auth/Auth'][0]['auth_context'];

    const extractedCustomAuthResource = (authContext['customAuthResource']).slice(8, -2);
    const customAuthResources = extractedCustomAuthResource.replace(/\\"/g, '"');
    let result;

    try {
      result = JSON.parse(customAuthResources);
    } catch (e) {
      result = extractedCustomAuthResource
    }

    return {
      customAuthResources: result,
      // authContext,
    };
  }).find((item: any) => item.customAuthResources !== 'undefined'))).customAuthResources;
}