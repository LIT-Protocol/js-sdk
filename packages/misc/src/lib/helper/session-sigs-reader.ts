import { parseSignedMessage } from './session-sigs-validator';
interface SessionInfo {
  requestTime: string;
  outerExpiration: {
    issuedAt: string;
    expiration: string;
    duration: string;
    status: string;
  };
  capabilities: Array<{
    type: string;
    issuedAt: string;
    expiration: string;
    duration: string;
    status: string;
    resources: {
      att: Record<string, Record<string, string[]>>;
      prf: string[];
    };
  }>;
}

interface ResolvedAuthContext {
  auth_context: {
    actionIpfsIds: string[];
    authMethodContexts: any[];
    authSigAddress: any;
    customAuthResource: string;
    resources: any[];
  }
}
interface ProcessedSessionInfo {
  att?: any;
  customAuthSource?: string;
  error?: string;
}

function formatDuration(start: Date, end: Date): string {
  const diff = end.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = ((diff % (1000 * 60)) / 1000).toFixed(3);

  let elapsedTime: string;

  if (days > 0) {
    elapsedTime = `${days} days`;
  } else if (hours > 0) {
    elapsedTime = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  } else {
    elapsedTime = `${minutes} minutes, ${seconds} seconds`;
  }

  return elapsedTime;
}

function formatStatus(expirationDate: Date, currentDate: Date): string {
  if (expirationDate > currentDate) {
    const timeLeft = formatDuration(currentDate, expirationDate);
    return `✅ Not expired (valid for ${timeLeft})`;
  } else {
    const timeAgo = formatDuration(expirationDate, currentDate);
    return `❌ Expired (expired ${timeAgo} ago)`;
  }
}

export function formatSessionSigs(
  sessionSigs: string,
  currentTime: Date = new Date()
): string {
  const parsedSigs = JSON.parse(sessionSigs);
  const firstNodeKey = Object.keys(parsedSigs)[0];
  const firstNode = parsedSigs[firstNodeKey];
  let signedMessage;

  try {
    signedMessage = JSON.parse(firstNode.signedMessage);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid JSON format for signedMessage: ${errorMessage}`);
  }

  const currentDate = new Date(currentTime);

  let result = `The request time is at: ${currentDate.toISOString()}\n`;

  // Outer expiration
  let issuedAt, expiration;
  try {
    issuedAt = new Date(signedMessage.issuedAt);
    expiration = new Date(signedMessage.expiration);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Error parsing issuedAt or expiration: ${errorMessage}`);
  }

  result += '* Outer expiration:\n';
  result += `    * Issued at: ${issuedAt.toISOString()}\n`;
  result += `    * Expiration: ${expiration.toISOString()}\n`;
  result += `    * Duration: ${formatDuration(issuedAt, expiration)}\n`;
  result += `    * Status: ${formatStatus(expiration, currentDate)}\n`;

  // Capabilities
  result += '* Capabilities:\n';
  signedMessage.capabilities.forEach((cap: any, index: number) => {
    const capType = cap.derivedVia;
    const parsedCapMessage = parseSignedMessage(cap.signedMessage);

    const capIssuedAt = new Date(parsedCapMessage['Issued At'] || '');
    const capExpiration = new Date(parsedCapMessage['Expiration Time'] || '');

    result += `    * Capability ${index + 1} (${capType}):\n`;
    result += `        * Issued at: ${capIssuedAt.toISOString()}\n`;
    result += `        * Expiration: ${capExpiration.toISOString()}\n`;
    result += `        * Duration: ${formatDuration(
      capIssuedAt,
      capExpiration
    )}\n`;
    result += `        * Status: ${formatStatus(capExpiration, currentDate)}\n`;
  });

  return result;
}

function decodeBase64(str: string): string {
  try {
    return atob(str);
  } catch (e) {
    console.error('Error decoding base64:', e);
    return str;
  }
}

export function formatSessionSigsJSON(
  sessionSigs: string,
  currentTime: Date = new Date()
): SessionInfo[] {
  const parsedSigs = JSON.parse(sessionSigs);
  const currentDate = new Date(currentTime);
  const results: SessionInfo[] = [];

  Object.entries(parsedSigs).forEach(([nodeKey, nodeValue]: [string, any]) => {
    let signedMessage;

    try {
      signedMessage = JSON.parse(nodeValue.signedMessage);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`Invalid JSON format for signedMessage in node ${nodeKey}: ${errorMessage}`);
      return; // Skip this node and continue with the next one
    }

    let result: SessionInfo = {
      requestTime: currentDate.toISOString(),
      outerExpiration: {
        issuedAt: '',
        expiration: '',
        duration: '',
        status: '',
      },
      capabilities: [],
    };

    // Outer expiration
    let issuedAt, expiration;
    try {
      issuedAt = new Date(signedMessage.issuedAt);
      expiration = new Date(signedMessage.expiration);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error parsing issuedAt or expiration in node ${nodeKey}: ${errorMessage}`);
      return; // Skip this node and continue with the next one
    }

    result.outerExpiration = {
      issuedAt: issuedAt.toISOString(),
      expiration: expiration.toISOString(),
      duration: formatDuration(issuedAt, expiration),
      status: formatStatus(expiration, currentDate),
    };

    // Capabilities
    signedMessage.capabilities.forEach((cap: any) => {
      const capType = cap.derivedVia;
      const parsedCapMessage = parseSignedMessage(cap.signedMessage);

      const capIssuedAt = new Date(parsedCapMessage['Issued At'] || '');
      const capExpiration = new Date(parsedCapMessage['Expiration Time'] || '');
      const capResources = parsedCapMessage['- urn'] || '';

      const encodedStr = (capResources as string).split('recap:')[1];
      const decodedData = decodeBase64(encodedStr);

      let jsonDecodedData;

      try {
        jsonDecodedData = JSON.parse(decodedData);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        jsonDecodedData = decodedData;
      }

      result.capabilities.push({
        type: capType,
        issuedAt: capIssuedAt.toISOString(),
        expiration: capExpiration.toISOString(),
        duration: formatDuration(capIssuedAt, capExpiration),
        status: formatStatus(capExpiration, currentDate),
        resources: jsonDecodedData,
      });
    });

    results.push(result);
  });

  return results;
}

export function getResourcesFromSessionSigs(sessionSigs: string): ProcessedSessionInfo[] {

  const formattedSessionSigs = formatSessionSigsJSON(sessionSigs);

  return formattedSessionSigs.map((sessionInfo): ProcessedSessionInfo => {
    const result: ProcessedSessionInfo = {};

    const capabilities = sessionInfo.capabilities;
    const litBlsCapability = capabilities.find((c) => c.type === 'lit.bls');

    if (litBlsCapability && litBlsCapability.resources) {
      const litBlsResources = litBlsCapability.resources;
      const resolvedAuthContextKey = Object.keys(litBlsResources.att).find((k) => k.startsWith('lit-resolvedauthcontext'));

      if (resolvedAuthContextKey) {
        const resolvedAuthContextObject = litBlsResources.att[resolvedAuthContextKey];
        if (resolvedAuthContextObject['Auth/Auth'] && resolvedAuthContextObject['Auth/Auth'][0]) {
          const resolvedAuthContext = resolvedAuthContextObject['Auth/Auth'][0] as unknown as ResolvedAuthContext;
          result.att = litBlsResources.att;
          result.customAuthSource = resolvedAuthContext.auth_context.customAuthResource;
        } else {
          result.error = "No Auth/Auth data found in resolvedAuthContextObject";
        }
      } else {
        result.error = "No lit-resolvedauthcontext key found in resources";
      }
    } else {
      result.error = "No lit.bls capability found or no resources in the capability";
    }

    return result;
  });
}

