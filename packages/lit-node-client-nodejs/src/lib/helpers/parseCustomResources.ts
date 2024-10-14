export function parseCustomResources(nodeResponses: any) {
  return ((nodeResponses.values.map((item: any) => {
    return {
      signedMessage: item.siweMessage
    };
  }).map((v: any) => {
    const signedMessage = v.signedMessage;
    const urnLine = signedMessage.match(/urn:recap:[\w\d]+/)![0];

    const authContext = JSON.parse(atob(urnLine.split(':')[2])).att['lit-resolvedauthcontext://*']['Auth/Auth'][0]['auth_context'];

    const extractedCustomAuthResource = (authContext['customAuthResource']).slice(8, -2);
    const formattedCustomAuthResource = extractedCustomAuthResource.replace(/\\"/g, '"');
    let result;

    try {
      result = JSON.parse(formattedCustomAuthResource);
    } catch (e) {
      result = extractedCustomAuthResource
    }

    return {
      authContext,
      formattedCustomAuthResource: result,
    };
  }).find((item: any) => item.formattedCustomAuthResource !== 'undefined')))?.formattedCustomAuthResource
}