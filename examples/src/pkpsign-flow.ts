import { init } from './init';

export const pkpSignFlow = async () => {
  const { litClient, viemAccountPkp, viemAuthContext } = await init();

  const res = await litClient.chain.ethereum.pkpSign({
    authContext: viemAuthContext,
    pubKey: viemAccountPkp.publicKey,
    toSign: 'Hello, world!',
  });

  console.log('✅ res:', res);

  process.exit();
};

pkpSignFlow();
