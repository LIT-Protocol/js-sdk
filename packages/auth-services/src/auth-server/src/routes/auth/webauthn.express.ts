import { Express } from 'express';
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { generateAuthenticatorUserInfo } from './webauthn/helpers/generateAuthenticatorUserInfo';
import { getDomainFromUrl } from './webauthn/helpers/getDomainFromUrl';

export const registerWebAuthnRoutes = (app: Express) => {
  app.get('/auth/webauthn/generate-registration-options', async (req, res) => {
    const username = (req.query['username'] as string | undefined) ?? undefined;
    const originHeader =
      (req.headers['origin'] as string | undefined) || 'localhost';

    let rpID = getDomainFromUrl(originHeader);
    if (originHeader) {
      try {
        rpID = new URL(originHeader).hostname;
      } catch (e) {
        console.warn(
          `[AuthServer] Invalid Origin header: "${originHeader}". Using default rpID "${rpID}".`
        );
      }
    } else {
      console.warn(
        `[AuthServer] Origin header missing. Using default rpID "${rpID}".`
      );
    }

    const authenticator = generateAuthenticatorUserInfo(username);

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: 'Lit Protocol',
      rpID,
      userID: authenticator.userId,
      userName: authenticator.username,
      timeout: 60000,
      attestationType: 'direct',
      authenticatorSelection: {
        userVerification: 'required',
        residentKey: 'required',
      },
      supportedAlgorithmIDs: [-7, -257],
    };

    const options = generateRegistrationOptions(opts);
    return res.status(200).json(options);
  });
};
