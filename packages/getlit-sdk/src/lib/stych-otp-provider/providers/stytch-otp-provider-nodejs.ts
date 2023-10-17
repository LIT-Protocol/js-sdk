import { AuthMethod } from "@lit-protocol/types";
import { LitAuthClient } from "@lit-protocol/lit-auth-client";

import * as stytchNode from 'stytch';
import { ProviderType } from "@lit-protocol/constants";
import { isNode } from "../../utils";
import { StytchOTPProviderNodeJSOptions, StytchOTPProviderOptionsNodeJS } from "../../types";
import { cacheStychOTP, convertToMinutes, getStychOTPStorageUID } from "./helpers";

const MAX_EXPIRATION_LENGTH = 60;
const MAX_EXPIRATION_UNIT = 'minutes';

export class StytchOTPProviderNodeJS {

  private config: StytchOTPProviderOptionsNodeJS
  public stytchNodeClient!: stytchNode.Client;
  public methodId!: string;

  constructor(config: StytchOTPProviderOptionsNodeJS) {

    if (!isNode()) {
      throw new Error("This class it not supported in node.js. Please use StytchOTPProviderBundledBrowser instead.");
    }

    globalThis.Lit.authClient?.initProvider(ProviderType.StytchOtp)

    this.config = config;
  }

  connect() {

    this.config = this.config as StytchOTPProviderOptionsNodeJS;

    // -- try to assign from env vars if not found in arguments
    if (!this.config.secret) {
      this.config.secret = process.env['STYTCH_SECRET'];
    }

    if (!this.config.projectId) {
      this.config.secret = process.env['STYTCH_PROJECT_ID'];
    }

    // -- check if required params are provided
    if (!this.config.secret) throw new Error('Stytch secret must be provided');
    if (!this.config.projectId) throw new Error('Stytch project id must be provided');

    // -- initialise stytch client
    this.stytchNodeClient = new stytchNode.Client({
      project_id: this.config.projectId,
      secret: this.config.secret,
    });

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

      if (method === 'email') {
        res = await this.stytchNodeClient.otps[method].loginOrCreate({
          email: userId,
        });
        methodId = res.email_id;
      }

      else if (method === 'sms' || method === 'whatsapp') {
        res = await this.stytchNodeClient.otps[method].loginOrCreate({
          phone_number: userId,
        });
        methodId = res.phone_id;
      } else {
        throw new Error('Invalid method');
      }

    } catch (e) {
      throw new Error(JSON.stringify(e));
    }

    if (!methodId) {
      throw new Error('methodId is not set');
    }

    this.setMethodId(methodId);

    return methodId;
  }

  async sendEmailOTP(email: string): Promise<string> {

    this.connect();

    let methodId
    let res;

    try {
      res = await this.stytchNodeClient.otps.email.loginOrCreate({
        email: email,
      });
      methodId = res.email_id;
    } catch (e: any) {
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

  async authenticate(options: StytchOTPProviderNodeJSOptions): Promise<AuthMethod> {

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
    let sessionStatus;

    authResponse = await this.stytchNodeClient.otps.authenticate({
      method_id: this.methodId,
      code: _options.code,
      session_duration_minutes: durationMinutes
    });

    sessionStatus = await this.stytchNodeClient.sessions.authenticate({
      session_token: authResponse.session_token,
    });

    const authProvider = globalThis.Lit.authClient?.initProvider(ProviderType.StytchOtp, {
      userId: sessionStatus.session.user_id,
      appId: '',
    });

    if (!authProvider) {
      throw new Error('authProvider is not set');
    }

    const authMethod = await authProvider.authenticate({
      accessToken: authResponse.session_token,
    });

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

    return authMethod;
  };
}