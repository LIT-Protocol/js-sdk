import { LIT_CHAINS, NETWORK_PUB_KEY } from './constants';

describe('constants', () => {
  const networkPubKey =
    '9971e835a1fe1a4d78e381eebbe0ddc84fde5119169db816900de796d10187f3c53d65c1202ac083d099a517f34a9b62';

  it(`Network public key should be ${networkPubKey}`, () => {
    expect(NETWORK_PUB_KEY).toEqual(networkPubKey);
  });

  const ethContract = '0xA54F7579fFb3F98bd8649fF02813F575f9b3d353';

  it(`Ethereum contract address should be ${ethContract}`, () => {
    expect(LIT_CHAINS['ethereum'].contractAddress).toEqual(ethContract);
  });

  const polygonContract = '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88';

  it(`Polygon contract address should be ${polygonContract}`, () => {
    expect(LIT_CHAINS['polygon'].contractAddress).toEqual(polygonContract);
  });

  const fantomContract = '0x5bD3Fe8Ab542f0AaBF7552FAAf376Fd8Aa9b3869';

  it(`Fantom contract address should be ${fantomContract}`, () => {
    expect(LIT_CHAINS['fantom'].contractAddress).toEqual(fantomContract);
  });

  const xdai = '0xDFc2Fd83dFfD0Dafb216F412aB3B18f2777406aF';

  it(`xdai contract address should be ${xdai}`, () => {
    expect(LIT_CHAINS['xdai'].contractAddress).toEqual(xdai);
  });

  const bsc = '0xc716950e5DEae248160109F562e1C9bF8E0CA25B';

  it(`bsc contract address should be ${bsc}`, () => {
    expect(LIT_CHAINS['bsc'].contractAddress).toEqual(bsc);
  });
});
