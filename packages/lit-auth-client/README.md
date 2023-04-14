# lit-auth-client

`lit-auth-client` makes it easy to manage PKP authentication with Lit Protocol. This library offers convenient methods for social logins, Ethereum wallet sign-ins, and minting and fetching of PKPs linked to auth methods.

<br>

## 📜 API Reference

Check out the [API reference]().

<br>

## 📦 Installation

Get started by installing the package:

```bash
yarn add @lit-protocol/lit-auth-client
```

<br>

## 💻 Usage

Easily integrate `lit-auth-client` in your web app.

- [Initialize `LitAuthClient`](#initialize-litauthclient)
<!-- prettier-ignore -->
- [Auth with social login](#auth-with-social-login)
<!-- prettier-ignore -->
- [Auth with Ethereum account](#auth-with-ethereum-account)
<!-- prettier-ignore -->
- [Mint a PKP with an auth method](#mint-a-pkp-with-an-auth-method)
<!-- prettier-ignore -->
- [Fetch PKPs linked to an auth method](#fetch-pkps-linked-to-an-auth-method)
<!-- prettier-ignore -->
- [Generate session signatures for PKPs tied to auth methods](#generate-session-signatures-for-pkps-tied-to-auth-methods)

<br>

### Initialize `LitAuthClient`

Create an instance of `LitAuthClient` to handle authentication for PKPs.

```js
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

const litAuthClient = new LitAuthClient({
  // The domain of your web app
  domain: '<Your Domain>',
  // The URL of your web app where users will be redirected after authentication
  redirectUri: '<Your Redirect URI>',
  // Request a Lit relay server API key here: https://forms.gle/RNZYtGYTY9BcD9MEA
  litRelayApiKey: '<Your Lit Relay Server API Key>',
});
```

If you are using Lit's relay server, you will need to request an api key [here](https://forms.gle/RNZYtGYTY9BcD9MEA).

<br>

### Auth with social login

#### Step 1: Start the social login flow

Enable users to authenticate with their Google or Discord accounts and create PKPs that are securely owned by their social accounts.

Call the `signInWithSocial` method and pass in the name of the social login provider you want to use:

```js
document.getElementById('social-login').addEventListener('click', () => {
  // Pass in 'google' to sign in with Google OAuth
  litAuthClient.signInWithSocial('google');
  // or pass in 'discord' to sign in with Discord OAuth
});
```

When clicked, users will be redirected to the social login page. Once users have successfully signed in, they will be redirected back to your web app.

<br>

#### Step 2: Handle the social login callback

At the `redirectUri` specified in the `LitAuthClient` constructor, call `handleSignInRedirect`. You can also use `isSignInRedirect` method to check if the app is in the redirect state or not.

```js
if (litAuthClient.isSignInRedirect()) {
  const authMethod = litAuthClient.handleSignInRedirect();
}
```

The `handleSignInRedirect` method validates the URL parameters returned from Lit's login server after a successful social login, and then returns an `AuthMethod` object containing the OAuth token.

<br>

### Auth with Ethereum account

Enable users to authenticate using their Ethereum accounts and generate PKPs that are safely owned by their Ethereum wallets.

To verify that the user owns the Ethereum account, you will need to generate an `AuthSig`, or auth signature. Use the `signInWithEthWallet` method to generate an `AuthSig`.

```js
// Example of a function that signs a message with the user's wallet and returns the signature
const signMessage = async (message: string) => {
  const signature = await signer.signMessage(message);
  return signature;
};

const authMethod = await litAuthClient.signInWithEthWallet({
  // The Ethereum address of the user's wallet
  address: address,
  // Your signMessage function
  signMessage: signMessage,
});
```

`signInWithEthWallet` returns an `AuthMethod` object containing the stringified `AuthSig` object as the value of the `accessToken` property.

<br>

### Mint a PKP with an auth method

Now that you have an `AuthMethod` object, you can mint a PKP using `mintPKPWithAuthMethod`.

```js
const newPKP = await litAuthClient.mintPKPWithAuthMethod(authMethod);
```

<br>

### Fetch PKPs linked to an auth method

You can fetch all PKPs linked to an auth method using `fetchPKPsForAuthMethod`.

```js
const pkps = await litAuthClient.fetchPKPsByAuthMethod(authMethod);
```

<br>

### Generate session signatures for PKPs tied to auth methods

**Session signatures** prove that the user has verified their ownership of a PKP and has granted permission to a specific set of resources that the PKP can be used to interact with.

`LitAuthClient` provides a convenient method that wraps [`getSessionSigs`](https://js-sdk.litprotocol.com/classes/lit_node_client_src.LitNodeClientNodeJs.html#getSessionSigs) to generate a **session signature** for a given PKP and auth method.

```js
const sessionSigs = await litAuthClient.getSessionSigsWithAuth({
  // Public key of the PKP you want to auth with
  pkpPublicKey: pkpPublicKey,
  // Auth method verifying ownership of the given PKP
  authMethod: authMethod,
  // Parameters for getSessionSigs. Check the API reference for available options.
  sessionSigsParams: {
    chain: 'ethereum',
    resources: [`litAction://*`],
  },
});
```

Learn more about session sigs in the [developer docs](https://developer.litprotocol.com/SDK/Explanation/WalletSigs/sessionSigs#resources-you-can-request).

<br>

## 🙌 Contributing

This library was generated with [Nx](https://nx.dev).

### Building

Run `nx build lit-auth-client` to build the library.

### Running unit tests

Run `nx test lit-auth-client` to execute the unit tests via [Jest](https://jestjs.io).
