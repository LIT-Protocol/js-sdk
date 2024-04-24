import { isNode } from '@lit-protocol/misc';
import { LitEndpoint } from '@lit-protocol/types';

/**
 * Compose the Lit URL
 * @param params
 * @returns the composed URL
 */
export const composeLitUrl = (params: {
  url: string;
  endpoint: LitEndpoint;
}) => {
  // check if params.url is a valid URL
  try {
    new URL(params.url);
  } catch (error) {
    throw new Error(`[composeLitUrl] Invalid URL: "${params.url}"`);
  }

  let versionOverride: string | null = null;

  // Get the version override for a particular endpoint
  // FIXME: We will remove this completly once v0.1 is deployed to all public networks
  if (isNode()) {
    versionOverride = process.env[`${params.endpoint.envName}`] || null;
  }

  // Use the overridden version if it exists, otherwise use the default
  const version = versionOverride || params.endpoint.version;

  return `${params.url}${params.endpoint.path}${version}`;
};
