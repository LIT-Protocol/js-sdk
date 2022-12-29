import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import crypto from 'crypto';

const ceramic = new CeramicClient('https://ceramic-clay.3boxlabs.com')

// `seed` must be a 32-byte long Uint8Array
export async function authenticateCeramic(seed) {
  const provider = new Ed25519Provider(seed)
  const did = new DID({ provider, resolver: getResolver() })
  // Authenticate the DID with the provider
  await did.authenticate()
  // The Ceramic client can create and update streams using the authenticated DID
  ceramic.did = did
}

export async function createDocument(content) {
  // The following call will fail if the Ceramic instance does not have an authenticated DID
  const doc = await TileDocument.create(ceramic, content)
  // The stream ID of the created document can then be accessed as the `id` property
  return doc.id
}

// // generate a random seed using crypto package
// const seed = crypto.randomBytes(32)
// await authenticateCeramic(seed)
// const docId = await createDocument({ foo: 'bar' })
// console.log(docId)
