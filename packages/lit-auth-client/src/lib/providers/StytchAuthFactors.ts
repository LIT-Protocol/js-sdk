import { StytchToken } from '@lit-protocol/types';
import { ethers } from 'ethers';

export type FactorParser = 'email' | 'sms' | 'whatsApp' | 'totp';

export const emailOtpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  let authFactor = authFactors.find((value, _index, _obj) => {
    if (value.email_factor) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find email authentication info in session');
  }
  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new Error(
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = authFactor.email_factor.email_address;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};

export const smsOtpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  let authFactor = authFactors.find((value, _index, _obj) => {
    if (value.phone_number_factor) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find email authentication info in session');
  }
  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new Error(
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = authFactor.phone_number_factor.phone_number;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};

export const whatsAppOtpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  let authFactor = authFactors.find((value, _index, _obj) => {
    if (value.phone_number_factor) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find email authentication info in session');
  }
  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new Error(
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = authFactor.phone_number_factor.phone_number;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};

export const totpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  let authFactor = authFactors.find((value, _index, _obj) => {
    if (value.phone_number_factor) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find email authentication info in session');
  }
  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new Error(
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = authFactor.authenticator_app_factor.totp_id;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};
