import { AuthMethod, SignInWithOTPParams } from '@lit-protocol/types';

export class OtpSession {
  private _params: SignInWithOTPParams;
  private _baseUrl = 'http://127.0.0.1';
  private _port = '8080';
  private _startRoute = '/api/otp/start';
  private _checkRoute = '/api/otp/check';
  private _requestId: string = '';
  constructor(params: SignInWithOTPParams) {
    this._params = params;
  }

  public async sendOtpCode(): Promise<boolean> {
    const url = this._buildUrl('start');
    this._requestId =
      this._params.requestId ?? (Math.random() * 10000 + 1).toString(10);
    let body: any = {
      otp: this._params.userId,
      requestId: this._requestId,
    };
    body = JSON.stringify(body);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body,
    });

    if (response.status < 200 || response.status >= 400) {
      console.warn('Something wrong with  OTP request', await response.json());
      const err = new Error('Unable to start otp verification');
      throw err;
    }
    
    return true;
  }

  public async checkOtpCode(code: string): Promise<AuthMethod> {
    const url = this._buildUrl('check');
    
    /**
        pub struct OtpCheckRequest {
        pub otp: String,
        pub code: String,
        pub request_id: String,
        }
     */
    let body: any = {
      otp: this._params.userId,
      code,
      requestId: this._requestId,
    };
    body = JSON.stringify(body);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body,
    });

    if (response.status < 200 || response.status >= 400) {
      console.warn('Something wrong with  OTP request', await response.json());
      const err = new Error('Unable to start otp verification');
      throw err;
    }

    const respBody: any = await response.json();

    if (!respBody.token_jwt) {
        throw new Error("Invalid otp code, operation was aborted");
    }
    
    return {
        authMethodType: 7, // OTP
        accessToken: respBody.token_jwt
    };
  }

  private _buildUrl(route: string): string {
    switch (route) {
      case 'start':
        return `${this._buildUrl}:${this._port}${this._startRoute}`;
      case 'check':
        return `${this._buildUrl}:${this._port}${this._checkRoute}`;
      default:
        return '';
    }
  }
}
