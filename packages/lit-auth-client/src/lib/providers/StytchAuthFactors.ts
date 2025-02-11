import { ethers } from 'ethers';

import { WrongParamFormat } from '@lit-protocol/constants';
import { StytchToken } from '@lit-protocol/types';

import type {
  AuthenticationFactor,
  AuthenticatorAppFactor,
  EmailFactor,
  PhoneNumberFactor,
} from 'stytch';

export type FactorParser = 'email' | 'sms' | 'whatsApp' | 'totp';

export const emailOtpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const session = parsedToken[provider];
  const authFactors: AuthenticationFactor[] = session['authentication_factors'];

  const authFactor = authFactors.find((value) => !!value.email_factor);

  if (!authFactor) {
    throw new WrongParamFormat(
      {
        info: {
          parsedToken,
          provider,
        },
      },
      'Could not find email authentication info in session'
    );
  }

  const emailFactor = authFactor.email_factor as EmailFactor;

  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new WrongParamFormat(
      {
        info: {
          parsedToken,
          provider,
        },
      },
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = emailFactor.email_address;
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
  const authFactors: AuthenticationFactor[] = session['authentication_factors'];
  const authFactor = authFactors.find((value) => !!value.phone_number_factor);

  if (!authFactor) {
    throw new WrongParamFormat(
      {
        info: {
          parsedToken,
          provider,
        },
      },
      'Could not find phone authentication info in session'
    );
  }

  const phoneNumberFactor = authFactor.phone_number_factor as PhoneNumberFactor;

  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new WrongParamFormat(
      {
        info: {
          parsedToken,
          provider,
        },
      },
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = phoneNumberFactor.phone_number;
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
  const authFactors: AuthenticationFactor[] = session['authentication_factors'];
  const authFactor = authFactors.find((value) => !!value.phone_number_factor);

  if (!authFactor) {
    throw new WrongParamFormat(
      {
        info: {
          parsedToken,
          provider,
        },
      },
      'Could not find phone authentication info in session'
    );
  }

  const phoneNumberFactor = authFactor.phone_number_factor as PhoneNumberFactor;

  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new WrongParamFormat(
      {
        info: {
          parsedToken,
          provider,
        },
      },
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = phoneNumberFactor.phone_number;
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
  const authFactors: AuthenticationFactor[] = session['authentication_factors'];
  const authFactor = authFactors.find(
    (value) => !!value.authenticator_app_factor
  );

  if (!authFactor) {
    throw new WrongParamFormat(
      {
        info: {
          parsedToken,
          provider,
        },
      },
      'Could not find authenticator app authentication info in session'
    );
  }

  const authenticatorAppFactor =
    authFactor.authenticator_app_factor as AuthenticatorAppFactor;

  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new WrongParamFormat(
      {
        info: {
          parsedToken,
          provider,
        },
      },
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = authenticatorAppFactor.totp_id;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};
