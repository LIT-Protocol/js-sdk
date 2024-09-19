import {
  AuthSig,
  Capability,
  ParsedSessionMessage,
  ParsedSignedMessage,
  SessionSigsMap,
} from '@lit-protocol/types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Function to parse a signedMessage string into an object
function parseSignedMessage(signedMessage: string): ParsedSignedMessage {
  const lines = signedMessage.split('\n');
  const parsedData: ParsedSignedMessage = {};
  let currentKey: string | null = null as string | null;
  let currentValue = '';

  lines.forEach((line) => {
    // Match lines with 'Key: Value' pattern
    const keyValueMatch = line.match(/^([^:]+):\s*(.*)$/);

    if (keyValueMatch) {
      // Save the previous key-value pair
      if (currentKey !== null) {
        parsedData[currentKey.trim()] = currentValue.trim();
      }

      // Start a new key-value pair
      currentKey = keyValueMatch[1];
      currentValue = keyValueMatch[2];
    } else if (line.startsWith('- ')) {
      // Handle list items
      const item = line.substring(2).trim();
      if (!parsedData[currentKey!]) {
        parsedData[currentKey!] = [];
      }
      (parsedData[currentKey!] as string[]).push(item);
    } else if (line.trim() === '') {
      // Skip empty lines
    } else {
      // Continuation of the current value
      currentValue += '\n' + line;
    }
  });

  // Save the last key-value pair
  if (currentKey !== null) {
    parsedData[currentKey.trim()] = currentValue.trim();
  }

  // parsedData: {
  //   'localhost wants you to sign in with your Ethereum account': '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  //   'This is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf': "(1) 'Auth': 'Auth' for 'lit-ratelimitincrease://24529'.",
  //   URI: 'lit:capability:delegation',
  //   Version: '1',
  //   'Chain ID': '1',
  //   Nonce: '0x921dd92f497527857ee8dda62f1805e56c34c99a6b37691b4e56e6fb171a5a70',
  //   'Issued At': '2024-09-19T13:07:33.606Z',
  //   'Expiration Time': '2024-09-26T13:07:33.602Z',
  //   Resources: '',
  //   '- urn': 'recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjQ1MjkiOnsiQXV0aC9BdXRoIjpbeyJuZnRfaWQiOlsiMjQ1MjkiXSwidXNlcyI6IjIwMCJ9XX19LCJwcmYiOltdfQ'
  // }
  return parsedData;
}

// Function to validate expiration date
function validateExpiration(
  expirationTimeStr: string,
  context: string
): ValidationResult {
  const errors: string[] = [];
  const expirationTime = new Date(expirationTimeStr);
  const currentTime = new Date();

  if (isNaN(expirationTime.getTime())) {
    errors.push(
      `Invalid Expiration Time format in ${context}: ${expirationTimeStr}`
    );
  } else if (expirationTime < currentTime) {
    errors.push(
      `Expired ${context}. Expiration Time: ${expirationTime.toISOString()}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Function to parse and validate capabilities
function parseCapabilities(capabilities: Capability[]): ValidationResult {
  const errors: string[] = [];

  capabilities.forEach((capability, index) => {
    const { signedMessage } = capability;

    // Parse the signedMessage
    const parsedCapabilityMessage = parseSignedMessage(signedMessage);
    capability.parsedSignedMessage = parsedCapabilityMessage;

    // Extract and validate expiration date
    const expirationTimeStr = parsedCapabilityMessage['Expiration Time'];

    if (expirationTimeStr) {
      const validationResult = validateExpiration(
        expirationTimeStr,
        `capability ${index}`
      );
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors);
      }
    } else {
      errors.push(
        `Expiration Time not found in capability ${index}'s signedMessage.`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the session signature.
 *
 * @param sessionSig - The session signature to validate.
 * @returns The validation result, indicating whether the session signature is valid and any errors encountered during validation.
 */
export function validateSessionSig(sessionSig: AuthSig): ValidationResult {
  const errors: string[] = [];

  // Parse the main signedMessage
  let parsedSignedMessage: ParsedSessionMessage;
  try {
    parsedSignedMessage = JSON.parse(sessionSig.signedMessage);
  } catch (error) {
    errors.push('Main signedMessage is not valid JSON.');
    return { isValid: false, errors };
  }

  // Validate capabilities
  const capabilities: Capability[] = parsedSignedMessage.capabilities;

  if (!capabilities) {
    errors.push('Capabilities not found in main signedMessage.');
  } else if (capabilities.length === 0) {
    errors.push('No capabilities found in main signedMessage.');
  } else {
    const capabilitiesValidationResult = parseCapabilities(capabilities);

    if (!capabilitiesValidationResult.isValid) {
      errors.push(...capabilitiesValidationResult.errors);
    }
  }

  // Validate outer expiration
  const outerExpirationTimeStr = parsedSignedMessage['expiration'];

  if (outerExpirationTimeStr) {
    const validationResult = validateExpiration(
      outerExpirationTimeStr,
      'main signedMessage'
    );
    if (!validationResult.isValid) {
      errors.push(...validationResult.errors);
    }
  } else {
    errors.push('Expiration Time not found in outer signedMessage.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the session signatures.
 *
 * @param sessionSigs - The session signatures to validate.
 * @returns The validation result, indicating whether the session signatures are valid and any errors encountered during validation.
 */
export function validateSessionSigs(
  sessionSigs: SessionSigsMap
): ValidationResult {
  const errors: string[] = [];

  Object.entries(sessionSigs).forEach(([key, sessionSig]) => {
    const validationResult = validateSessionSig(sessionSig);

    if (!validationResult.isValid) {
      errors.push(
        `Session Sig '${key}': ${validationResult.errors.join(', ')}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
