import { NodeClient } from '@lit-protocol/node-client';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';
import { CustomNetwork, LitNodeClientConfig } from '@lit-protocol/types';

export class LitNodeClient extends NodeClient {
  constructor(args: any[LitNodeClientConfig | CustomNetwork | any]) {
    super({
      ...args,
      defaultAuthCallback: checkAndSignAuthMessage,
    });
  }
}
