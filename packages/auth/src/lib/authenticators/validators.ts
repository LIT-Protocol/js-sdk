import { MintRequestBody } from '@lit-protocol/types';

export const validateMintRequestBody = (
  customArgs: Partial<MintRequestBody>
): boolean => {
  let isValid = true;
  const validKeys = [
    'keyType',
    'permittedAuthMethodTypes',
    'permittedAuthMethodIds',
    'permittedAuthMethodPubkeys',
    'permittedAuthMethodScopes',
    'addPkpEthAddressAsPermittedAddress',
    'sendPkpToItself',
  ];

  // Check for any extraneous keys
  for (const key of Object.keys(customArgs)) {
    if (!validKeys.includes(key)) {
      console.error(
        `Invalid key found: ${key}. This key is not allowed. Valid keys are: ${validKeys.join(
          ', '
        )}`
      );
      isValid = false;
    }
  }

  if (
    customArgs.keyType !== undefined &&
    typeof customArgs.keyType !== 'number'
  ) {
    console.error('Invalid type for keyType: expected a number.');
    isValid = false;
  }

  if (
    customArgs.permittedAuthMethodTypes !== undefined &&
    (!Array.isArray(customArgs.permittedAuthMethodTypes) ||
      !customArgs.permittedAuthMethodTypes.every(
        (type) => typeof type === 'number'
      ))
  ) {
    console.error(
      'Invalid type for permittedAuthMethodTypes: expected an array of numbers.'
    );
    isValid = false;
  }

  if (
    customArgs.permittedAuthMethodIds !== undefined &&
    (!Array.isArray(customArgs.permittedAuthMethodIds) ||
      !customArgs.permittedAuthMethodIds.every((id) => typeof id === 'string'))
  ) {
    console.error(
      'Invalid type for permittedAuthMethodIds: expected an array of strings.'
    );
    isValid = false;
  }

  if (
    customArgs.permittedAuthMethodPubkeys !== undefined &&
    (!Array.isArray(customArgs.permittedAuthMethodPubkeys) ||
      !customArgs.permittedAuthMethodPubkeys.every(
        (pubkey) => typeof pubkey === 'string'
      ))
  ) {
    console.error(
      'Invalid type for permittedAuthMethodPubkeys: expected an array of strings.'
    );
    isValid = false;
  }

  if (
    customArgs.permittedAuthMethodScopes !== undefined &&
    (!Array.isArray(customArgs.permittedAuthMethodScopes) ||
      !customArgs.permittedAuthMethodScopes.every(
        (scope) =>
          Array.isArray(scope) && scope.every((s) => typeof s === 'number')
      ))
  ) {
    console.error(
      'Invalid type for permittedAuthMethodScopes: expected an array of arrays of numberr.'
    );
    isValid = false;
  }

  if (
    customArgs.addPkpEthAddressAsPermittedAddress !== undefined &&
    typeof customArgs.addPkpEthAddressAsPermittedAddress !== 'boolean'
  ) {
    console.error(
      'Invalid type for addPkpEthAddressAsPermittedAddress: expected a boolean.'
    );
    isValid = false;
  }

  if (
    customArgs.sendPkpToItself !== undefined &&
    typeof customArgs.sendPkpToItself !== 'boolean'
  ) {
    console.error('Invalid type for sendPkpToItself: expected a boolean.');
    isValid = false;
  }

  return isValid;
};
