import { t } from 'elysia';

export const mintPkpDoc = {
  body: t.Object(
    {
      sendPkpToItself: t.Optional(
        t.Boolean({
          default: false,
          description:
            "If true, the minted PKP's ETH address is set as its own recipient. Defaults to false.",
        })
      ),
      pubkey: t.Optional(
        t.String({
          default: '0x',
          description:
            "Public key associated with the authentication method. This is primarily used for WebAuthn, where it should be the public key obtained from the WebAuthn registration process. For other authentication types, if this field is omitted or an empty string is provided, it will default to '0x'. If explicitly providing for non-WebAuthn, use '0x'.",
        })
      ),
    },
    {
      description:
        'Request body for asynchronously minting a Programmable Key Pair (PKP).',
    }
  ),
  detail: {
    summary: 'Queue a PKP Minting Request',
    description: `Accepts parameters for minting a new PKP and adds the request to a queue for asynchronous processing. The response will include a \`jobId\` which can be used to check the status of the minting process via the \`/status/:jobId\` endpoint.\n\nThe \`pubkey\` field is especially relevant for WebAuthn authentication.`,
    tags: ['PKP'],
  },
  response: {
    202: t.Object({
      jobId: t.String({
        description: 'The ID of the queued job for minting the PKP.',
      }),
      message: t.String({
        description:
          'A message indicating the request was queued successfully.',
      }),
    }),
    500: t.Object({
      error: t.String(),
      details: t.Optional(t.String()),
    }),
  },
};
