import { SessionCapabilityObject } from '@lit-protocol/auth';
import { Chain } from '@lit-protocol/constants';

export interface GetSessionSigsProps {
  // When this session signature will expire.  The user will have to reauthenticate after this time using whatever auth method you set up.
  // This means you will have to call this signSessionKey function again to get a new session signature.  This is a RFC3339 timestamp.
  // The default is 24 hours from now.
  expiration?: any;

  // The chain to use for the session signature.  This is the chain that will be used to sign the session key.  If you're using EVM then
  // this probably doesn't matter at all.
  chain: Chain;

  // These are the resources that will be signed with the session key. You may pass a wildcard that allows these session signatures to work
  // with any resource on Lit. To see a list of resources,check out the docs:
  // https://developer.litprotocol.com/sdk/explanation/walletsigs/sessionsigs/#resources-you-can-request
  resources: string[];

  // An optional dictionary of capabilities that you want to request for this session. If this field is not provided, then this will default
  // to a wildcard for each type of resource you're accessing. For example, if the resource provided is ["litEncryptionCondition://123456"]
  // then this would default to ["litEncryptionConditionCapability://*"], which would grant this session signature the ability to decrypt
  // any resource. This object MUST be compatible with EIP-5573 SIWE ReCap, see: https://ethereum-magicians.org/t/eip-5573-siwe-recap/10627.
  sessionCapabilityObject?: SessionCapabilityObject;

  // If you want to ask Metamask to try and switch the user's chain, you may pass true here.  This will only work if the user is using Metamask.
  // If the user is not using Metamask, then this will be ignored.
  switchChain?: boolean;

  // This is a callback that will be called if the user needs to authenticate using a PKP. For example, if the user has no wallet, but owns a
  // Lit PKP though something like Google Oauth, then you can use this callback to prompt the user to authenticate with their PKP. This callback
  // should use the LitNodeClient.signSessionKey function to get a session signature for the user from their PKP. If you don't pass this callback,
  // then the user will be prompted to authenticate with their wallet, like metamask.
  authNeededCallback?: any;
  sessionKey?: any;
}
