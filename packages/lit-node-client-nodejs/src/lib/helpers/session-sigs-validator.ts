import {
  AuthSig,
  Capability,
  ParsedSessionMessage,
  ParsedSignedMessage,
} from '@lit-protocol/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Function to parse a signedMessage string into an object
export function parseSignedMessage(signedMessage: string): ParsedSignedMessage {
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

  return parsedData;
}

// Function to validate expiration date
export function validateExpiration(
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
export function parseCapabilities(
  capabilities: Capability[]
): ValidationResult {
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

export function validateSessionSignature(
  sessionSig: AuthSig
): ValidationResult {
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
  const capabilitiesValidationResult = parseCapabilities(capabilities);

  if (!capabilitiesValidationResult.isValid) {
    errors.push(...capabilitiesValidationResult.errors);
  }

  // Validate main expiration
  const mainExpirationTimeStr = parsedSignedMessage['expiration'];

  if (mainExpirationTimeStr) {
    const validationResult = validateExpiration(
      mainExpirationTimeStr,
      'main signedMessage'
    );
    if (!validationResult.isValid) {
      errors.push(...validationResult.errors);
    }
  } else {
    errors.push('Expiration Time not found in main signedMessage.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
