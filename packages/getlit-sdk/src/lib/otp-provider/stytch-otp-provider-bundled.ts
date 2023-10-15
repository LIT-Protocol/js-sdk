import { AuthMethod } from "@lit-protocol/types";
import { LitAuthClient } from "@lit-protocol/lit-auth-client";

import * as stytchNode from 'stytch';
import * as stytchBrowser from '@stytch/vanilla-js';
import { ProviderType } from "@lit-protocol/constants";
import { isBrowser, isNode } from "../utils";

export interface StytchOTPProviderBundledOptions {
  projectId?: string;
  secret?: string;
  publicToken?: string;
}

interface StytchOTPProviderBundledAuthenticateOptions {
  code?: string;
  durationMinutes?: number;
}

export class StytchOTPProviderBundled {

  private config: StytchOTPProviderBundledOptions;
  public stytchNodeClient!: stytchNode.Client;
  public stytchBrowserClient!: stytchBrowser.StytchUIClient
  public methodId!: string;

  constructor(config: StytchOTPProviderBundledOptions) {
    this.config = config;
  }

  connect() {
    // -- try to assign from env vars if not found in arguments
    if (isNode()) {
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

    if (isBrowser()) {
      if (!this.config.publicToken) throw new Error('Stytch public token must be provided');

      // -- initialise stytch client
      this.stytchBrowserClient = new stytchBrowser.StytchUIClient(this.config.publicToken);
    }
  }

  setMethodId(methodId: string) {
    this.methodId = methodId;
  }

  async sendEmailOTP(email: string): Promise<string> {

    this.connect();

    console.log("Sending email OTP to:", email);

    let methodId
    let res;

    if (isNode()) {
      try {
        res = await this.stytchNodeClient.otps.email.loginOrCreate({
          email: email,
        });
        methodId = res.email_id;
      } catch (e: any) {
        throw new Error(JSON.stringify(e));
      }
      console.log("XX res:", res);
    }

    if (isBrowser()) {
      try {
        res = await this.stytchBrowserClient.otps.email.loginOrCreate(email);
        methodId = res.method_id
      } catch (e) {
        throw new Error(JSON.stringify(e));
      }

      console.log("YY res:", res);
    }

    if (!methodId) {
      throw new Error('methodId is not set');
    }

    console.log('methodId:', methodId);

    this.setMethodId(methodId);

    return methodId;
  }

  public async fetchPKPsThroughRelayer(authMethod: AuthMethod) {
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
      },
      version: 'V3'
    });

    return await litAuthClient.initProvider(ProviderType.EthWallet).fetchPKPsThroughRelayer(authMethod);
  }

  public getAuthMethodStorageUID(accessToken: string) {
    if (!accessToken) {
      throw new Error('accessToken is not set');
    }

    return 'Testing123';
  }

  async authenticate<T extends StytchOTPProviderBundledAuthenticateOptions>(options?: T): Promise<AuthMethod> {

    const code = options?.code;
    const durationMinutes = options?.durationMinutes || 60 * 24 * 7 * 7;

    if (!this.methodId) {
      throw new Error('methodId is not set');
    }

    if (!code) {
      throw new Error('code is not set');
    }

    let authResponse;
    let sessionStatus;

    if (isNode()) {

      authResponse = await this.stytchNodeClient.otps.authenticate({
        method_id: this.methodId,
        code,
        session_duration_minutes: durationMinutes
      });

      sessionStatus = await this.stytchNodeClient.sessions.authenticate({
        session_token: authResponse.session_token,
      });
    } else {

      authResponse = await this.stytchBrowserClient.otps.authenticate(this.methodId, code);

      sessionStatus = await this.stytchBrowserClient.session.authenticate({
        session_duration_minutes: durationMinutes
      })
    }

    // -- initialise lit auth client
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
      },
      version: 'V3'
    });

    const authProvider = litAuthClient.initProvider(ProviderType.StytchOtp, {
      userId: sessionStatus.session.user_id,
      appId: this.config.projectId,
    });

    const authMethod = await authProvider.authenticate({
      accessToken: authResponse.session_token,
    });

    console.log("authMethod:", authMethod);

    return authMethod;
  };

}