import { HexPrefixedSchema } from '@lit-protocol/schemas';
import * as nacl from 'tweetnacl';
import { hexToBytes } from 'viem';
import { z } from 'zod';
import { RawHandshakeResponseSchema } from '../handshake/handshake.schema';

export type NodeKeySetsMap = Record<
  string,
  {
    theirPublicKey: Uint8Array;
    secretKey: Uint8Array;
  }
>;

export type ServerKeys = Record<
  string,
  z.infer<typeof RawHandshakeResponseSchema>['data']
>;

export function generateNodeKeySets(
  urls: string[],
  serverKeys: ServerKeys
): NodeKeySetsMap {
  const keySets: NodeKeySetsMap = {};

  urls.forEach((url) => {
    const theirPublicKey = hexToBytes(
      HexPrefixedSchema.parse(
        serverKeys[url].nodeIdentityKey as `0x${string}`
      ) as `0x${string}`
    );
    const keyPair = nacl.box.keyPair();
    const secretKey = keyPair.secretKey;

    keySets[url] = {
      theirPublicKey,
      secretKey,
    };
  });

  return keySets;
}
