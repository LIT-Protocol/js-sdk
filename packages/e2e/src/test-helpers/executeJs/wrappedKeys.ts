import { randomBytes, createHash } from 'crypto';
import { Wallet } from 'ethers';

import {
  api as wrappedKeysApi,
  constants as wrappedKeysConstants,
} from '@lit-protocol/wrapped-keys';
import type {
  LitClient,
  ExportPrivateKeyResult,
  GeneratePrivateKeyResult,
  StoreEncryptedKeyBatchResult,
  StoreEncryptedKeyResult,
  ImportPrivateKeyResult,
  StoredKeyData,
  StoredKeyMetadata,
  BatchGeneratePrivateKeysResult,
  SignTransactionParamsSupportedEvm,
} from '@lit-protocol/wrapped-keys';
import type { SessionSigsMap } from '@lit-protocol/types';

const DEFAULT_NETWORK = wrappedKeysConstants.NETWORK_EVM;

export interface WrappedKeysExecuteJsContext {
  litClient: LitClient;
  sessionSigs: SessionSigsMap;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const randomMemo = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const randomCiphertext = () => randomBytes(48).toString('base64');

const randomHash = (input: string) =>
  createHash('sha256').update(input).digest('hex');

const createStorePayload = (memo?: string) => {
  const ciphertext = randomCiphertext();
  return {
    ciphertext,
    dataToEncryptHash: randomHash(ciphertext),
    publicKey: `0x${randomBytes(33).toString('hex')}`,
    keyType: 'K256' as const,
    memo: memo ?? randomMemo('store'),
  };
};

export async function generateWrappedKey(
  context: WrappedKeysExecuteJsContext,
  memo = randomMemo('generated')
): Promise<{ memo: string; result: GeneratePrivateKeyResult }> {
  const result = await wrappedKeysApi.generatePrivateKey({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    network: DEFAULT_NETWORK,
    memo,
  });

  return { memo, result };
}

export async function listWrappedKeyMetadata(
  context: WrappedKeysExecuteJsContext
): Promise<StoredKeyMetadata[]> {
  return wrappedKeysApi.listEncryptedKeyMetadata({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
  });
}

export async function getWrappedKey(
  context: WrappedKeysExecuteJsContext,
  id: string
): Promise<StoredKeyData> {
  return wrappedKeysApi.getEncryptedKey({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    id,
  });
}

export async function exportWrappedKey(
  context: WrappedKeysExecuteJsContext,
  id: string
): Promise<ExportPrivateKeyResult> {
  return wrappedKeysApi.exportPrivateKey({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    id,
    network: DEFAULT_NETWORK,
  });
}

export async function signMessageWithWrappedKey(
  context: WrappedKeysExecuteJsContext,
  id: string,
  message: string
): Promise<string> {
  return wrappedKeysApi.signMessageWithEncryptedKey({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    id,
    network: DEFAULT_NETWORK,
    messageToSign: message,
  });
}

const EVM_NETWORK: SignTransactionParamsSupportedEvm['network'] = 'evm';

export async function signTransactionWithWrappedKey(
  context: WrappedKeysExecuteJsContext,
  id: string,
  unsignedTransaction: SignTransactionParamsSupportedEvm['unsignedTransaction'] = {
    toAddress: ZERO_ADDRESS,
    value: '0',
    chainId: 1,
    chain: 'ethereum',
  },
  broadcast = false
): Promise<string> {
  const request: SignTransactionParamsSupportedEvm = {
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    id,
    network: EVM_NETWORK,
    unsignedTransaction,
    broadcast,
  };

  return wrappedKeysApi.signTransactionWithEncryptedKey(request);
}

export async function storeWrappedKey(
  context: WrappedKeysExecuteJsContext,
  overrides?: Partial<ReturnType<typeof createStorePayload>>
): Promise<{ payload: ReturnType<typeof createStorePayload>; result: StoreEncryptedKeyResult }> {
  const payload = { ...createStorePayload(), ...overrides };

  const result = await wrappedKeysApi.storeEncryptedKey({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    ...payload,
  });

  return { payload, result };
}

export async function storeWrappedKeyBatch(
  context: WrappedKeysExecuteJsContext,
  count = 2
): Promise<{
  payload: ReturnType<typeof createStorePayload>[];
  result: StoreEncryptedKeyBatchResult;
}> {
  const payload = Array.from({ length: count }, () => createStorePayload());

  const result = await wrappedKeysApi.storeEncryptedKeyBatch({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    keyBatch: payload,
  });

  return { payload, result };
}

export async function importWrappedKey(
  context: WrappedKeysExecuteJsContext,
  memo = randomMemo('imported')
): Promise<{ wallet: Wallet; memo: string; result: ImportPrivateKeyResult }> {
  const wallet = Wallet.createRandom();
  const result = await wrappedKeysApi.importPrivateKey({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    keyType: 'K256',
    memo,
  });

  return { wallet, memo, result };
}

export async function batchGenerateWrappedKeys(
  context: WrappedKeysExecuteJsContext,
  count = 2
): Promise<BatchGeneratePrivateKeysResult> {
  const actions = Array.from({ length: count }, (_, idx) => {
    const memo = randomMemo(`batch-${idx}`);
    return {
      network: DEFAULT_NETWORK,
      generateKeyParams: { memo },
      ...(idx === 0
        ? { signMessageParams: { messageToSign: `batch-${idx}-message` } }
        : {}),
    };
  });

  return wrappedKeysApi.batchGeneratePrivateKeys({
    pkpSessionSigs: context.sessionSigs,
    litClient: context.litClient,
    actions,
  });
}
