import { z } from 'zod';

import { MultipleAccessControlConditionsSchema } from '@lit-protocol/access-control-conditions-schemas';

import { ILitNodeClientSchema } from './ILitNodeClient';
import {
  AuthSigAuthenticationSchema,
  ChainSchema,
  ChainedSchema,
  SessionSigsAuthenticationSchema,
  SessionSigsMapSchema,
} from './schemas';

const ChainMultipleAccessControlConditionsSchema =
  MultipleAccessControlConditionsSchema.merge(ChainedSchema);
const SessionSigsDecryptRequestBaseSchema =
  ChainMultipleAccessControlConditionsSchema.merge(
    SessionSigsAuthenticationSchema
  );
const AuthSigDecryptRequestBaseSchema =
  ChainMultipleAccessControlConditionsSchema.merge(AuthSigAuthenticationSchema);
export const DecryptRequestBaseSchema = z.union([
  SessionSigsDecryptRequestBaseSchema,
  AuthSigDecryptRequestBaseSchema,
]);

export const EncryptResponseSchema = z.object({
  /**
   * The base64-encoded ciphertext
   */
  ciphertext: z.string(),
  /**
   * The hash of the data that was encrypted
   */
  dataToEncryptHash: z.string(),
});

export const DecryptRequestSchema = z.union([
  EncryptResponseSchema.merge(SessionSigsDecryptRequestBaseSchema),
  EncryptResponseSchema.merge(AuthSigDecryptRequestBaseSchema),
]);

export const DecryptResponseSchema = z.object({
  // The decrypted data as a Uint8Array
  decryptedData: z.instanceof(Uint8Array),
});

const EncryptRequestBaseSchema = z.object({
  // The data to encrypt as a Uint8Array
  dataToEncrypt: z.instanceof(Uint8Array),
});
const SessionSigsEncryptRequestBaseSchema = EncryptRequestBaseSchema.merge(
  SessionSigsDecryptRequestBaseSchema
);
const AuthSigEncryptRequestBaseSchema = EncryptRequestBaseSchema.merge(
  AuthSigDecryptRequestBaseSchema
);
export const EncryptRequestSchema = z.union([
  SessionSigsEncryptRequestBaseSchema,
  AuthSigEncryptRequestBaseSchema,
]);

export const EncryptUint8ArrayRequestSchema =
  MultipleAccessControlConditionsSchema.extend({
    /**
     * The uint8array that you wish to encrypt
     */
    dataToEncrypt: z.instanceof(Uint8Array),
  });

export const EncryptStringRequestSchema =
  MultipleAccessControlConditionsSchema.extend({
    /**
     * The string that you wish to encrypt
     */
    dataToEncrypt: z.string(),
  });

export const EncryptFileRequestSchema =
  MultipleAccessControlConditionsSchema.extend({
    file: z.union([z.instanceof(File), z.instanceof(Blob)]),
  });

const EncryptToJsonPayloadBaseSchema = z.object({
  ciphertext: z.string(),
  dataToEncryptHash: z.string(),
  dataType: z.enum(['string', 'file'] as const),
});
const SessionSigsEncryptToJsonPayloadSchema =
  EncryptToJsonPayloadBaseSchema.merge(SessionSigsDecryptRequestBaseSchema);
const AuthSigEncryptToJsonPayloadSchema = EncryptToJsonPayloadBaseSchema.merge(
  AuthSigDecryptRequestBaseSchema
);
export const EncryptToJsonPayloadSchema = z.union([
  SessionSigsEncryptToJsonPayloadSchema,
  AuthSigEncryptToJsonPayloadSchema,
]);

export const EncryptToJsonPropsSchema =
  MultipleAccessControlConditionsSchema.extend({
    /**
     * The chain
     */
    chain: ChainSchema,
    /**
     * The string you wish to encrypt
     */
    string: z.string().optional(),
    /**
     * The file you wish to encrypt
     */
    file: z.union([z.instanceof(File), z.instanceof(Blob)]).optional(),
    /**
     * An instance of LitNodeClient that is already connected
     */
    litNodeClient: ILitNodeClientSchema,
  });

export const DecryptFromJsonPropsSchema = z.object({
  // the session signatures to use to authorize the user with the nodes
  sessionSigs: SessionSigsMapSchema,

  // An instance of LitNodeClient that is already connected
  litNodeClient: ILitNodeClientSchema,

  parsedJsonData: EncryptToJsonPayloadSchema,
});
