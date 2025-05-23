import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { ElysiaInstance } from '../../../types/ElysiaInstance.type';
import { generateAuthenticatorUserInfo } from './helpers/generateAuthenticatorUserInfo';
import { getDomainFromUrl } from './helpers/getDomainFromUrl';
import { resp } from '../../../response-helpers/response-helpers';

export const webAuthnGenerateRegistrationOptionsRoute = (
  app: ElysiaInstance
) => {
  return app.get(
    '/webauthn/generate-registration-options',
    async ({ query, headers, set }) => {
      const username = query.username as string | undefined;
      const originHeader = headers['origin'] || 'localhost';

      // Determine rpID from Origin header, default to 'localhost'
      let rpID = getDomainFromUrl(originHeader);

      if (originHeader) {
        try {
          rpID = new URL(originHeader).hostname;
        } catch (e) {
          // Log warning if Origin header is present but invalid
          console.warn(
            `[AuthServer] Invalid Origin header: "${originHeader}". Using default rpID "${rpID}".`
          );
        }
      } else {
        // Log warning if Origin header is missing
        console.warn(
          `[AuthServer] Origin header missing. Using default rpID "${rpID}".`
        );
      }

      // Generate a unique username string if not provided.
      // This is used for 'userName' and as input for 'userID' generation.
      const authenticator = generateAuthenticatorUserInfo(username);

      const opts: GenerateRegistrationOptionsOpts = {
        rpName: 'Lit Protocol',
        rpID, // Relying Party ID (your domain)
        userID: authenticator.userId,
        userName: authenticator.username,
        timeout: 60000, // 60 seconds
        attestationType: 'direct', // Consider 'none' for better privacy if direct attestation is not strictly needed
        authenticatorSelection: {
          userVerification: 'required', // Require user verification (e.g., PIN, biometric)
          residentKey: 'required', // Create a client-side discoverable credential
        },
        // Supported public key credential algorithms.
        // -7: ES256 (ECDSA with P-256 curve and SHA-256)
        // -257: RS256 (RSA PKCS#1 v1.5 with SHA-256)
        supportedAlgorithmIDs: [-7, -257],
      };

      const options = generateRegistrationOptions(opts);

      return resp.SUCCESS(options);
    }
  );
};
