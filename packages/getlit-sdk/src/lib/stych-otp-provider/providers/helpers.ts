import { AuthMethod, ExpirableOptions, ExpirableOptionsRequired } from "@lit-protocol/types";

const PROVIDER = 'https://stytch.com/session';

export function getStychOTPStorageUID(accessToken: string) {

  if (!accessToken) {
    throw new Error('accessToken is not set');
  }

  const _atob = (str: string) => Buffer.from(str, 'base64').toString('utf8');

  const body = JSON.parse(_atob(accessToken.split('.')[1]));

  const authFactors = body[PROVIDER].authentication_factors[0];

  let id = authFactors?.email_factor?.email_address ??
    'sms-' + authFactors?.phone_number_factor?.phone_number

  return `lit-otp-token-${id}`;
}

export function convertToMinutes(expirationUnit: 'seconds' | 'minutes' | 'hours' | 'days') {
  switch (expirationUnit) {
    case 'seconds':
      return 1 / 60;
    case 'minutes':
      return 1;
    case 'hours':
      return 60;
    case 'days':
      return 60 * 24;
    default:
      throw new Error(`Invalid unit of time: ${expirationUnit}`);
  }
}
export function cacheStychOTP({
  expiration,
  authMethod,
}: {
  expiration: ExpirableOptionsRequired;
  authMethod: AuthMethod;
}) {

  const storageUID = getStychOTPStorageUID(authMethod.accessToken);
  const storageProvider = globalThis.Lit.storage;

  if (!expiration.maxLength) {
    throw new Error('expiration.maxLength is not set');
  }

  if (storageProvider?.isExpired(storageUID)) {

    const userExpirationISOString = storageProvider.convertToISOString(
      expiration.expirationLength,
      expiration.expirationUnit
    );

    const maxExpirationISOString = storageProvider.convertToISOString(
      expiration.maxLength,
      expiration.expirationUnit
    );

    const userExpirationDate = new Date(userExpirationISOString);
    const maxExpirationDate = new Date(maxExpirationISOString); // Just convert the ISO string to a Date

    if (userExpirationDate > maxExpirationDate) {
      throw new Error(
        `The expiration date for this auth method cannot be more than ${expiration.maxLength} ${expiration.expirationUnit} from now. Please provide a valid expiration length and unit.}`
      );
    }

    storageProvider.setExpirableItem(
      storageUID,
      JSON.stringify(authMethod),
      expiration.expirationLength,
      expiration.expirationUnit
    );

  }
}