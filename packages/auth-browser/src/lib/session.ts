import { LIT_SESSION_KEY_URI } from '@lit-protocol/constants';

/**
 *
 * Get Session Key URI eg. lit:session:
 *
 * @returns { string }
 *
 */
export const getSessionKeyUri = ({
  publicKey,
}: {
  publicKey: string,
}): string => {
  return LIT_SESSION_KEY_URI + publicKey;
};

/**
 *
 * Parse resource
 *
 * @property { any } resource
 *
 * @returns { { protocol: string, resourceId: string } }
 *
 */
export const parseResource = ({
  resource,
}: {
  resource: any,
}): {
  protocol: any,
  resourceId: any,
} => {
  const [protocol, resourceId] = resource.split('://');
  return { protocol, resourceId };
};
