import { AuthMethod, StytchToken } from "@lit-protocol/types";
import { StytchOtpProvider } from "@lit-protocol/lit-auth-client";

import * as stytchBrowser from '@stytch/vanilla-js';
import { AuthMethodType, ProviderType } from "@lit-protocol/constants";
import { isBrowser } from "../../utils";
import { StytchOTPProviderBrowserOptions, StytchOTPProviderOptionsBrowser } from "../../types";
import { cacheStychOTP, convertToMinutes, getStychOTPStorageUID } from "./helpers";

const MAX_EXPIRATION_LENGTH = 60;
const MAX_EXPIRATION_UNIT = 'minutes';

export class StytchOTPProviderBrowser {

  private config: StytchOTPProviderOptionsBrowser
  public stytchBrowserClient!: stytchBrowser.StytchUIClient
  public methodId!: string;

  constructor(config: StytchOTPProviderOptionsBrowser) {

    if (!isBrowser()) {
      throw new Error("This class it not supported in NodeJS. Please use StytchOTPProviderBundledNodeJS instead.");
    }

    globalThis.Lit.authClient?.initProvider(ProviderType.StytchOtp)

    this.config = config;
  }

  connect() {

    this.config = this.config as StytchOTPProviderOptionsBrowser;

    // -- check if required params are provided
    if (!this.config.publicToken) throw new Error('Stytch public token must be provided');

    // -- initialise stytch client
    this.stytchBrowserClient = new stytchBrowser.StytchUIClient(this.config.publicToken);

  }

  setMethodId(methodId: string) {
    this.methodId = methodId;
  }

  async sendOTP({ method, userId }: {
    method: 'email' | 'sms' | 'whatsapp',
    userId: string
  }): Promise<string> {

    this.connect();

    let methodId;
    let res;

    try {
      res = await this.stytchBrowserClient.otps[method].loginOrCreate(userId);
      methodId = res.method_id;
    } catch (e) {
      throw new Error(JSON.stringify(e));
    }

    if (!methodId) {
      throw new Error('methodId is not set');
    }

    this.setMethodId(methodId);

    return methodId;
  }


  public async fetchPKPsThroughRelayer(authMethod: AuthMethod) {
    return await globalThis.Lit.authClient?.initProvider(ProviderType.StytchOtp).fetchPKPsThroughRelayer(authMethod);
  }

  public getAuthMethodStorageUID(accessToken: string) {
    return getStychOTPStorageUID(accessToken);
  }

  async authenticate(options: StytchOTPProviderBrowserOptions): Promise<AuthMethod> {

    const _options = {
      cache: true,
      ...options,
    };

    const durationLength = _options.expirationLength || MAX_EXPIRATION_LENGTH;
    const durationUnit = _options.expirationUnit || MAX_EXPIRATION_UNIT;
    const durationMinutes = durationLength * convertToMinutes(durationUnit);

    if (!this.methodId) {
      throw new Error('methodId is not set');
    }

    if (!_options.code) {
      throw new Error('code is not set');
    }

    if (!durationMinutes) {
      throw new Error('durationMinutes is not set');
    }

    let authResponse;

    authResponse = await this.stytchBrowserClient.otps.authenticate(_options.code, this.methodId, {
      session_duration_minutes: durationMinutes
    });

    console.log("authResponse:", authResponse);

    const parsedToken: StytchToken = StytchOtpProvider.parseJWT(authResponse.session_jwt);

    console.log("parsedToken:", parsedToken);

    // The 'project_id' corresponds to the Stytch project. In a browser environment, 
    // where only the public token is required, the default 'project_id' is used. 
    // so we do not need to check for it here.
    // This can be located at https://stytch.com/dashboard/api-keys
    const audience = (parsedToken['aud'] as string[])[0];

    if (!audience) throw new Error("could not find project id in token body. Please check your Stytch public token.");

    const session = parsedToken['https://stytch.com/session'];
    const authFactor = session['authentication_factors'][0];

    console.log("session:", session);
    console.log("authFactor:", authFactor);

    const authMethod = {
      authMethodType: AuthMethodType.StytchOtp,
      accessToken: authResponse.session_jwt,
    };

    if (_options?.cache) {
      cacheStychOTP({
        authMethod,
        expiration: {
          cache: _options.cache,
          expirationLength: durationLength,
          expirationUnit: durationUnit,
          maxLength: MAX_EXPIRATION_LENGTH,
        }
      });
    }

    return authMethod
  };
}