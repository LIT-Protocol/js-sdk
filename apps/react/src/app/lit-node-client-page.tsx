import * as LitJsSdk from '@lit-protocol/lit-node-client';
import * as authBrowser from '@lit-protocol/auth-browser';

const LitNodeClientPage = () => {
  async function go() {
    const client = new LitJsSdk.LitNodeClient({
      litNetwork: 'cayenne',
      debug: true,
    });

    await client.connect();

    const res = await client.executeJs({
      targetNodeRange: 3,
      authSig: {
        sig: '0x721a354498677a1024fb48a78e56c68fd11ad705565933dd9ac770501cecad8811e8591453e21ab50d2579c3d2fe7b0dcbcb1b6436c67e9c6263169c182f50bd1b',
        derivedVia: 'web3.eth.personal.sign',
        signedMessage:
          'demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0xEDA4f4A8AbCecB28bf1663df9257Ec6F188B8107\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: hwrDnUCFsiR10S2lX\nIssued At: 2023-01-25T14:26:44.497Z\nExpiration Time: 2023-02-01T14:26:44.480Z',
        address: '0xeda4f4a8abcecb28bf1663df9257ec6f188b8107',
      },

      jsParams: {},
      code: `(async() => {
                console.log("RUN TEST BABY!");
              })();`,
      // ipfsId: 'QmPxtvDXmBb3H5YSG3kJJcoSknfvwp6P6T1aZjNUWcm5Cb',
    });

    console.log('res:', res);
  }

  const authBrowserTest = async () => {
    console.log('authBrowser:', authBrowser);

    // @ts-ignore 
    globalThis.authBrowser = authBrowser;

    const client = new LitJsSdk.LitNodeClient({
      litNetwork: 'cayenne',
      debug: true,
    });

    const latestBlockhash = await client.getLatestBlockhash();

    const authsig = await authBrowser.checkAndSignAuthMessage({
      chain: 'ethereum',
      nonce: latestBlockhash,
    });
    console.log('authsig:', authsig)
  };

  return (
    <>
      <button onClick={go}>Go</button>
      <button onClick={authBrowserTest}>AuthBrowser test</button>
    </>
  );
};

export default LitNodeClientPage;
