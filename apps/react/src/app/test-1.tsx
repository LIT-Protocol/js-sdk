import * as LitJsSdk from 'dist/packages/lit-node-client';

const Test1 = () => {
  const go = async () => {
    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'serrano',
    });
    await litNodeClient.connect();

    const sessionSigs = await litNodeClient.getSessionSigs({
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      chain: 'ethereum',
      resources: [`litEncryptionCondition://*`],
      switchChain: false,
    });
    console.log('sessionSigs before saving encryption key: ', sessionSigs);

    const { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptString(
      'this is a secret message'
    );

    console.log('encryptedZip:', encryptedZip);
    console.log('symmetricKey:', symmetricKey);

  };

  return (
    <>
      <button onClick={go}>Go</button>
    </>
  );
};
export default Test1;
