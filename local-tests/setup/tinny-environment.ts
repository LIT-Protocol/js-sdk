import {
  LIT_TESTNET,
  ProcessEnvs,
  RPC_MAP,
  TinnyEnvConfig,
} from './tinny-config';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  AuthSig,
  CosmosAuthSig,
  LitContractContext,
  LitContractResolverContext,
  SolanaAuthSig,
} from '@lit-protocol/types';
import { TinnyPerson } from './tinny-person';

import { ethers, Signer } from 'ethers';
import { createSiweMessage, generateAuthSig } from '@lit-protocol/auth-helpers';
import { ShivaClient, TestnetClient } from './shiva-client';
import { toErrorWithMessage } from './tinny-utils';
import { CENTRALISATION_BY_NETWORK } from '@lit-protocol/constants';

console.log('checking env', process.env['DEBUG']);
export class TinnyEnvironment {
  public network: LIT_TESTNET;

  /**
   * Environment variables used in the process.
   */
  public processEnvs: ProcessEnvs = {
    MAX_ATTEMPTS: parseInt(process.env['MAX_ATTEMPTS']) || 1,
    TEST_TIMEOUT: parseInt(process.env['TEST_TIMEOUT']) || 45000,
    NETWORK: (process.env['NETWORK'] as LIT_TESTNET) || LIT_TESTNET.LOCALCHAIN,
    DEBUG: process.env['DEBUG'] === 'true',
    REQUEST_PER_KILOSECOND:
      parseInt(process.env['REQUEST_PER_KILOSECOND']) ||
      (process.env['NETWORK'] as LIT_TESTNET) === 'datil-dev'
        ? 1
        : 200,
    LIT_RPC_URL: process.env['LIT_RPC_URL'],
    WAIT_FOR_KEY_INTERVAL:
      parseInt(process.env['WAIT_FOR_KEY_INTERVAL']) || 3000,
    BOOTSTRAP_URLS: process.env['BOOTSTRAP_URLS']?.split(',') || [
      'http://127.0.0.1:7470',
      'http://127.0.0.1:7471',
      'http://127.0.0.1:7472',
    ],
    TIME_TO_RELEASE_KEY: parseInt(process.env['TIME_TO_RELEASE_KEY']) || 10000,
    RUN_IN_BAND: process.env['RUN_IN_BAND'] === 'true',
    RUN_IN_BAND_INTERVAL: parseInt(process.env['RUN_IN_BAND_INTERVAL']) || 5000,

    // Available Accounts
    // ==================
    // (1) "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" (10000.000000000000000000 ETH)
    // (2) "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" (10000.000000000000000000 ETH)
    // (3) "0x90F79bf6EB2c4f870365E785982E1f101E93b906" (10000.000000000000000000 ETH)
    // (4) "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" (10000.000000000000000000 ETH)
    // (5) "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" (10000.000000000000000000 ETH)
    // (6) "0x976EA74026E726554dB657fA54763abd0C3a0aa9" (10000.000000000000000000 ETH)
    // (7) "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955" (10000.000000000000000000 ETH)
    // (8) "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f" (10000.000000000000000000 ETH)
    // (9) "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720" (10000.000000000000000000 ETH)
    PRIVATE_KEYS: process.env['PRIVATE_KEYS']?.split(',') || [
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
      '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
      '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
      '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
      '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
      '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
      '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
      '0x6193d2b41a85bfeb77a6b0c83995048fadc7281aaea32dc3b3a099618b81dbf0',
      '0xfee2f0aa543bac61c5853106cc13379c2b636492efce83cf27db54be8a5fae1f',
      '0x010043ccd30e0f2541933b4ca10f0f5c7bd6ca485a16e48c706570a4c236270d',
      '0xae2880b9ee914e384333482a6d4a4f66fe49056c947b557b477c525fdb508a5b',
      '0x3f28063562bdbf8faa1e1042dce40cfdf7364782870594ff539c9961648267b4',
      '0xad6ceaad60114de494c7a18c045377e7a2f3ac1792a6d5b95f8e8d822b38e1b9',
      '0xab579b9e99d7a1030b20998c0c211d0e72f77eefc2256ee96ef7fab5477abaf5',
      '0x733274c5f21888a76312580d1687d165e3c1eb5f4200cbbc71885f32172d6212',
      '0xca8d14115305767005b57696d5f023740f7d631cfe6152ff3b7107b7ee667ee4',
      '0x0699c7e2c35203658be00d9dfcd4f1ebf3422e75b846a3237aad6dcb0b0a481e',
      '0xc5f2b5f997fc5d319051b0952834b66bc670fff0c309d4b181e3833a0b8f7c2e',
      '0xec803696d804f1ab75a0a2402770c802a070166e28b95538ec1a54fed1400939',
      '0xb20b6f0a0c4300b76ab45b15b1160bcd518990ccd5a7a71758cc582fd74afceb',
      '0x29568a30dc40a38799bc78bd5807ca0b02e960fa9ae75538812c76d371926715',
      '0x2ea72aa12602aacfe32e70557996376359fb1ad6ab716e99d4991abb8ca27d32',
      '0x38ad3bfb4983249903f37c69f07744abbe7a6fff6b95a2c9b350ff547c568993',
      '0xc0fc97b1bbbd96bc12c7d764341798cb33a6dd5e5893ba52ddacdf7ac8f21fe3',
      '0x87a3d59bc9d300bf2580b727e427b107ee779876494aee31dfd35873132e75f7',
      '0xdbf1eafe262d1e54fe341308176904b2e1d2d6795840e8f2c76e424f58a99fc0',
      '0x975a7d1918f29d0462cdcb512539e48f46af28281a3bbad4b855493c9bd846e3',
      '0x580affa0ae4f193f630075e1f9c9a771cc10d043db2c64945c9a4046bce8b1aa',
      '0xf58977475ed7aa748fd8c0f36b8f842f206e3effb9082ee94e5b2635facd4eff',
      '0x092ba12bf3b6aa53a17a263f2b3e40c5d3ed8443ede081854897cedd850c2822',
      '0x2ef2a361096e14f2e8dbb6e95b313f2907da4da2cb78d49603651922e2e7ce84',
      '0xe097dfeb4efd54b56154ab2c44abb9fa8e9c8e677ca87d1a6a009aab7321bfb2',
      '0x895960337961f6166c02e067ba3ab1d93f067d72f8caeb9807d7694faa49022c',
      '0xaf79ea48b6165f136ebcaaccb5b7ce41d379b185b8ff548d174a40492d308224',
      '0x6f8fb2a8b8502147b7cb778d52c3cbc646ae90757ff1a7d61d93db347ffb8ecb',
      '0xf65a59ae99f5b378cfaa74cea955124808c8ceb333fb43110ae7c814b05689e5',
      '0xcaf4ea73ace5884d169df8c5979dad5dc4728a676f2e9cf100420560bc044d85',
      '0x9e907aa87358335f113e28037a802c1460ecdbb403f5ea2d4d0a86681ca0c9db',
      '0x16ded28948f6c729418704dd933a4392d3232825f26082085b710eeb5a69f149',
      '0xddcb060cd6e819b9161780d04ee6204bd1970a42b03a4986f635c9f469cb49a1',
      '0x2d7220ab62a2d55629cfaeb8b40270d3de10106eeb406c7acf8df2715511a99d',
      '0x9c9436f89db7f57910ce52c8e31b9bce0be93e641e5ab2a826a07c0b32328baf',
      '0xa8d3f3457154bb416948a0a4d6522dc731c3fbf8d3265742523879a18f416e1a',
      '0x76a6427014f30dca1bf0fc8889c257687409eb63466bc9e4cdd516e83c4e971f',
      '0xe71e04946e4bf474bcda6d4bc00910245b1389ecdd01c1ce32bb0a3acca46a76',
      '0x76cc1f033b952156556b46f91b6e0b5bf6baa0f30946035f6053ced96d232ed6',
      '0xc055b3e6975db597f4a9ab852762b965ac2afd9d7f32124fb4c759f1ba83c077',
      '0x824bbb391abe91d208f250ecf214dd9805d3d9f08c585b51ff17fc6afd1478a4',
      '0xa9a63044b0477debebca9eebac0ee81a48c953988614f4b05561697cfe69d879',
      '0x1ef3b514c4d97b5d4c41cc92ee144814293dc507a251d2b1abbcce792650ee92',
      '0x89a3a3250de5768db5ef5e5360308a087acdc6ebf2d810855e64212fc40f8088',
      '0x259afb4734a8eb8d50114d06212f98690fc219b96b5d412e469232f649fe5480',
      '0x26ec4632521b5cf11639fe46f25398cbe78b414690139d5851dab5402dc0c9fa',
      '0x305b9b8f7db8e84b46ee6c869bbaf229e90d24ec991cacea5bea749660df6fd1',
      '0x591d28e141982ccb4129beeb4ee2a87589158f9bbc001d4a18e3a93a1e436c65',
      '0xdd24b0edc0f008045e8502a794d136501b93f5b378dacafa4f8460b36695cdab',
      '0x5953095c2040c201acd99e88acef03f8333e5ef76795c81a73f77c05f60ce35b',
      '0x6e58ae63ba8440366d034e9c11a147e334698ab031691331f7ddcd37b115f999',
      '0xf0f053fcbe96543cb660f0db815905efcbf6404e07d0dd7aa6658a5976e18934',
      '0x59c899530f651638b0691b72cd32f9072c76fa37a73852c350203545a2ed3c01',
      '0xb6e5002883a6ceb31e2192f30e58028706669629f457b03595a5f23a0248adbb',
      '0x44eebe25e2b45f938a6510b793b05bb4936df295503ef7e07828d524ea119c45',
      '0xef66e769d4aab11257db7f0237351b800553f8d0042309fab91487301dfaa1c9',
      '0xb56c6c25a26676ae5de0c98e865e779c84f3664019907dd5bf7bd1087de77cdb',
      '0xc16b38123e60c941498595e3367cd08488c5e22e4b4089681c79d26e5e924979',
      '0x23b2290238929b9756afcbacfd353241478eb1283f2d3b62ac7147f591190990',
      '0xed9bd8cc0ea15646ad4ecbee4e86a7ad0dbf54964f2e99fc6ce6a449a40df91a',
      '0x43204ae7b0e61a248732cfc9c42a8fd1d22543159f115e503c7f24d9df950867',
      '0xb8b27e50a6afd13331dd6aaca7622a1cbbc123ce52e8b36268eedd1121b1480f',
      '0x3c0754c9e00911d6eea5d2ecb291791eb7403cf380edc3ada248de70c9c5b552',
      '0xbc740e89f9a4f94a98d897126cc459762047b22249b65d5a008867ffac591a87',
      '0x537b3d4760d65bfbe4872e7bbb5e2277fd2664f08bf6a4720f054f3f9836666e',
      '0x0247d341cbbd4c08d8a8813be72f8e265466e36e64fb2540e73a77d74d652db3',
      '0xd9bebf0e6300e1f1aeeed68ba20f903198be490cb7753756fbdd9b083ef8474c',
      '0x55b975183f1a2149d3e51289b5848082cbf794ca0f1f226595e49c498e52e096',
      '0x67696ac9ee0da9e49bd56e8c18fdbc5f03ce4f472bacca7c5f12c69b770c4117',
      '0x4df79eb28ee62135b040db4dfb587fe8fcc10428d938c937a638b389add9b768',
      '0xa6588a0efa6e113737bd86a71e60b8b37b1275350d69e619b6a680d27d996ea2',
      '0x3d3c8f4aa04379e0f448ae1fa563a7a366126c0441fa28f8b94e173ced275493',
      '0x235e8f2470bea2403789e0cfb028f1f2b354fa9b8bf3110852ce8bb8a364a363',
      '0xa9711a60a9d35374c1e6822a58e35760a1534107f4a2ffd147eb29c3372f22fe',
      '0xa2b7c9ef6d0baf2720605857148af76fe4e479e1589467f8dacc7cdf38ef742b',
      '0x7aa730dee6e5551c357fb226155973f3d609d9ee5fae36a8894e6ac86e405403',
      '0x859b687c6060bf2a715f0b4f34d848541b403adf4aaa18e4f6a483a02a27fd60',
      '0xe5066056c81106de74e88d229f0cfee13bda6d5e98539c03791fa91327c26d84',
      '0x187c2b3a807694dddc2ebe6798485410cbccf6de7f0c45e12dc0c96b46d87132',
      '0xe8a0975217d054431d620eaa8a8e2f6e659bb69d6f5ff84c6fc002531f14e315',
      '0x17c2b6378d53adc33fc6d03b4e511b3b6702b85ed7adc1adc630cb551c4bc946',
      '0xc640a39bfac6a0d8f2cf943ab3fae713ec0d0166809cff170891d5faa4edcc33',
      '0x5c2ce221a9ab22a070d84f44c6bb952a0ec58b783db416a07f3f8cac80fbb3a3',
      '0xe8a3a427ebff419d7e770013100ff02fa3331fe40970b6251052af093957a3f4',
      '0xf8f0941611aac1c2c156d2ebdfdf0ee61566c54ef2a8a7a475f37355e990420f',
      '0x88b9e197926043090d1248b7c421b79831bcf66a9851f1d04360b5334f746722',
      '0x8c87346bc1f2112cec6be3da1cfb80119e782aea62473e53dcd56a38e66f8a82',
      '0xfaf56e26bb088778ffcddb42d767b2455ff87ac9f33b1a15171856958f4c8906',
      '0x4bf7d1024d3dcb8f9b4c3015584e1de4b0d73e3cfa1700f9f888367fe8914ab1',
      '0xc88be5b62f75d270d5e20410aec32a1881e9005917c7ce9e7894dd1f73e13dc4',
      '0x1726dad79dc06ef3725419a0fa1562aae78b5b44c7797c721c9d4d72e1639241',
      '0x9876ea78509d708baafc8f0bf328ed2d4165a656cc63e3274069a29731cb4e03',
      '0xa54ed45d6f6e075d6c91713da1c51d0d1f334ee9f808118c352b229c32bc72c3',
      '0x398ec5121736b3c1b74db60fc7d2bc126d4042b1daf73277abceabeaacc9bf18',
      '0x5e720985979549fd80086ba1437ab8c1cc3c1d4000c417688077e6b01b003533',
      '0xe3854f0fd66a03b2ed5c604e50736f5db106c113b1c47040e53934f9bcc59245',
      '0x41cddc10bd6562e23b2b83c4988149f6407e79930d9e11868d6f7ac38223505d',
      '0x49c65f459beeaea7ce4d97f71799b25cc6090aab5fee9eeb6bf46ee89aad3626',
      '0xe82b4e05c682b8c514158a909add03ba131c38500231740e2b708b5ca7a2b14f',
      '0xa8fa6cd6c77aadc21dbb46a8f76bb4dd1dfa6139cc1d312686317ada6f9ddd46',
    ],
    KEY_IN_USE: new Array(),
    NO_SETUP: process.env['NO_SETUP'] === 'true',
    USE_SHIVA: process.env['USE_SHIVA'] === 'true',
    NETWORK_CONFIG: process.env['NETWORK_CONFIG'] ?? './networkContext.json',
  };

  public litNodeClient: LitNodeClient;
  public contractsClient: LitContracts;
  public rpc: string;
  public superCapacityDelegationAuthSig: AuthSig;
  public bareEthAuthSig: AuthSig;
  public bareSolAuthSig: SolanaAuthSig = {
    sig: '706047fcab06ada3cbfeb6990617c1705d59bafb20f5f1c8103d764fb5eaec297328d164e2b891095866b28acc1ab2df288a8729cf026228ef3c4970238b190a',
    derivedVia: 'solana.signMessage',
    signedMessage:
      'I am creating an account to use Lit Protocol at 2024-05-08T16:39:44.481Z',
    address: 'F7r6ENi6dqH8SnMYZdK3YxWAQ4cwfSNXZyMzbea5fbS1',
  };

  public bareCosmosAuthSig: CosmosAuthSig = {
    sig: 'dE7J8oaWa8zECuMpaI/IVfJXGpLAO1paGLho+/dmtaQkN7Sh1lmJLAdYqZchDyYhQcg+nqfaoEOzLig3CPlosg==',
    derivedVia: 'cosmos.signArbitrary',
    signedMessage:
      '8c857343720203e3f52606409e6818284186a614e74026998f89e7417eed4d4b',
    address: 'cosmos14wp2s5kv07lt220rzfae57k73yv9z2azrmulku',
  };

  public testnet: TestnetClient | undefined;
  //=========== PRIVATE MEMBERS ===========
  private _shivaClient: ShivaClient = new ShivaClient();
  private _contractContext: LitContractContext | LitContractResolverContext;

  constructor(network?: LIT_TESTNET) {
    // -- setup networkj
    this.network = network || this.processEnvs.NETWORK;

    if (Object.values(LIT_TESTNET).indexOf(this.network) === -1) {
      throw new Error(
        `Invalid network environment. Please use one of ${Object.values(
          LIT_TESTNET
        )}`
      );
    }

    // -- create an empty array to keep track of all keys
    this.processEnvs.KEY_IN_USE = new Array(
      this.processEnvs.PRIVATE_KEYS.length
    ).fill(false);

    // -- setup rpc
    // Priority:
    // 1. Use environment variable if set
    // 2. Use RPC_MAP if network is recognized
    // 3. Throw error if neither condition is met
    if (this.processEnvs.LIT_RPC_URL) {
      // If LIT_RPC_URL is set in the environment, use it
      this.rpc = this.processEnvs.LIT_RPC_URL;
    } else if (this.network in RPC_MAP) {
      // If the network is recognized in RPC_MAP, use the corresponding RPC URL
      this.rpc = RPC_MAP[this.network];
    } else {
      // If neither condition is met, throw an error with available options
      const availableNetworks = Object.keys(RPC_MAP).join(', ');
      throw new Error(
        `No RPC URL found for network "${this.network}". Available networks are: ${availableNetworks}`
      );
    }

    console.log(
      '[𐬺🧪 Tinny Environment𐬺] Done configuring enviorment current config: ',
      this.processEnvs
    );
  }

  world: Map<string, TinnyPerson> = new Map();

  /**
   * Retrieves an available private key from a list, marking it as in use and scheduling
   * its automatic release. If no unused keys are available, it waits for a set interval
   * before rechecking.
   *
   * This function loops until it finds an unused key, marks it, and returns the key with
   * its index. If all keys are in use, it logs a wait message and pauses before retrying.
   *
   * Outputs:
   * - privateKey: The selected private key.
   * - index: The index of the selected key.
   *
   * Environment variables required:
   * - KEY_IN_USE: Boolean array indicating key usage.
   * - PRIVATE_KEYS: Array of key strings.
   * - TIME_TO_RELEASE_KEY: Milliseconds until a key is automatically released.
   * - WAIT_FOR_KEY_INTERVAL: Wait time in milliseconds if no keys are free.
   */
  async getAvailablePrivateKey(): Promise<{
    privateKey: string;
    index: number;
  }> {
    while (true) {
      const index = this.processEnvs.KEY_IN_USE.findIndex((used) => !used); // Find the first unused key

      if (index !== -1) {
        // If an available key is found
        this.processEnvs.KEY_IN_USE[index] = true; // Mark the key as in use
        // console.log('[𐬺🧪 Tinny Environment𐬺] 🔑 Selected key at index', index); // Log a message indicating that we have selected a key

        return { privateKey: this.processEnvs.PRIVATE_KEYS[index], index }; // Return the key and its index
      } else {
        console.log('[𐬺🧪 Tinny Environment𐬺] No available keys. Waiting...'); // Log a message indicating that we are waiting
        // Wait for the specified interval before checking again
        await new Promise((resolve) =>
          setTimeout(resolve, this.processEnvs.WAIT_FOR_KEY_INTERVAL)
        );
      }
    }
  }

  /**
   * Marks a private key as available again after use.
   * @param {number} index - The index of the key to mark as available.
   */
  releasePrivateKeyFromUser(user: TinnyPerson) {
    const index = this.processEnvs.PRIVATE_KEYS.indexOf(user.privateKey);
    this.processEnvs.KEY_IN_USE[index] = false;
    // console.log(
    //   `[𐬺🧪 Tinny Environment𐬺] 🪽 Released key at index ${index}. Thank you for your service!`
    // );
  }

  /**
   * Marks a private key as available again after use.
   * @param {number} index - The index of the key to mark as available.
   */
  releasePrivateKey(index: number) {
    this.processEnvs.KEY_IN_USE[index] = false;
    // console.log(
    //   `[𐬺🧪 Tinny Environment𐬺] 🪽 Released key at index ${index}. Thank you for your service!`
    // );
  }

  /**
   * Initializes the LitNodeClient based on the specified network configuration and environment variables.
   * This setup differentiates between local and production environments, adjusts node attestation checks,
   * and sets network-specific parameters. The function ensures the client is connected and ready before proceeding.
   *
   * The LitNodeClient is configured differently based on the network:
   * - LOCALCHAIN: Uses custom settings for local testing, with node attestation disabled.
   * - MANZANO (or other specified testnets): Configures for specific network environments with node attestation enabled.
   *
   * Logs the process and exits if the client is not ready after attempting to connect.
   */

  async setupLitNodeClient() {
    console.log('[𐬺🧪 Tinny Environment𐬺] Setting up LitNodeClient');

    console.log('this.network:', this.network);
    const centralisation = CENTRALISATION_BY_NETWORK[this.network];

    if (
      this.network === LIT_TESTNET.LOCALCHAIN ||
      centralisation === 'unknown'
    ) {
      const networkContext =
        this?.testnet?.ContractContext ?? this._contractContext;
      this.litNodeClient = new LitNodeClient({
        litNetwork: 'custom',
        rpcUrl: this.rpc,
        debug: this.processEnvs.DEBUG,
        checkNodeAttestation: false, // disable node attestation check for local testing
        contractContext: networkContext,
      });
    } else if (centralisation === 'decentralised') {
      this.litNodeClient = new LitNodeClient({
        litNetwork: this.network,
        checkNodeAttestation: true,
        debug: this.processEnvs.DEBUG,
      });
    } else if (centralisation === 'centralised') {
      this.litNodeClient = new LitNodeClient({
        litNetwork: this.network,
        checkNodeAttestation: false,
        debug: this.processEnvs.DEBUG,
      });
    } else {
      throw new Error(`Network not supported: "${this.network}"`);
    }

    if (globalThis.wasmExports) {
      console.warn(
        'WASM modules already loaded. Will overide when connect is called'
      );
    }

    if (globalThis.wasmECDSA) {
      console.warn(
        'WASM modules already loaded. wil overide. when connect is called'
      );
    }

    if (globalThis.wasmSevSnpUtils) {
      console.warn(
        'WASM modules already loaded. wil overide. when connect is called'
      );
    }

    await this.litNodeClient.connect();

    if (!this.litNodeClient.ready) {
      console.error('❌ litNodeClient not ready');
      process.exit();
    }
  }

  /**
   * Retrieves the environment configuration.
   * @returns The TinnyEnvConfig object containing the environment configuration.
   */
  getEnvConfig(): TinnyEnvConfig {
    const contractContext =
      this?.testnet?.ContractContext ?? this._contractContext;
    return {
      rpc: this.rpc,
      litNodeClient: this.litNodeClient,
      network: this.network,
      processEnvs: this.processEnvs,
      contractContext: contractContext as LitContractResolverContext,
    };
  }

  /**
   * Creates a new person with the given name.
   * @param name - The name of the person.
   * @returns The newly created person.
   * @throws Error if the name is not provided.
   */
  async createNewPerson(name: string) {
    console.log('[𐬺🧪 Tinny Environment𐬺] Creating new person:', name);
    if (!name) {
      throw new Error('Name is required');
    }
    const key = await this.getAvailablePrivateKey();
    const privateKey = key.privateKey;
    const envConfig = this.getEnvConfig();

    const person = new TinnyPerson({
      privateKey,
      envConfig,
    });

    await person.spawn();

    this.world.set(name, person);

    return person;
  }

  /**
   * Retrieves a person from the world by their name.
   * @param name - The name of the person to retrieve.
   * @returns The person object if found, or undefined if not found.
   */
  getPerson(name: string) {
    return this.world.get(name);
  }

  /**
   * Creates a random person.
   * @returns A promise that resolves to the created person.
   */
  async createRandomPerson() {
    return await this.createNewPerson('Alice');
  }

  setUnavailable = (network: LIT_TESTNET) => {
    if (this.processEnvs.NETWORK === network) {
      throw new Error('LIT_IGNORE_TEST');
    }
  };

  /**
   * Init
   */
  async init() {
    try {
      if (this.processEnvs.NO_SETUP) {
        console.log('[𐬺🧪 Tinny Environment𐬺] Skipping setup');
        return;
      }
      if (
        this.network === LIT_TESTNET.LOCALCHAIN &&
        this.processEnvs.USE_SHIVA
      ) {
        this.testnet = await this._shivaClient.startTestnetManager();
        // wait for the testnet to be active before we start the tests.
        let state = await this.testnet.pollTestnetForActive();
        if (state === `UNKNOWN`) {
          console.log(
            'Testnet state found to be Unknown meaning there was an error with testnet creation. shutting down'
          );
          throw new Error(`Error while creating testnet, aborting test run`);
        }

        await this.testnet.getTestnetConfig();
      } else if (this.network === LIT_TESTNET.LOCALCHAIN) {
        const context = await import('./networkContext.json');
        this._contractContext = context;
      }

      await this.setupLitNodeClient();
      await this.setupSuperCapacityDelegationAuthSig();
      await this.setupBareEthAuthSig();
    } catch (e) {
      const err = toErrorWithMessage(e);
      console.log(
        `[𐬺🧪 Tinny Environment𐬺] Failed to init() tinny ${err.message}`
      );
      console.log(err.stack);
      process.exit(1);
    }
  }

  /**
   * Setup bare eth auth sig to test access control and decryption
   */
  async setupBareEthAuthSig() {
    const privateKey = await this.getAvailablePrivateKey();
    const provider = new ethers.providers.JsonRpcBatchProvider(this.rpc);
    const wallet = new ethers.Wallet(privateKey.privateKey, provider);

    const toSign = await createSiweMessage({
      walletAddress: wallet.address,
      nonce: await this.litNodeClient.getLatestBlockhash(),
      expiration: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
      litNodeClient: this.litNodeClient,
    });

    this.bareEthAuthSig = await generateAuthSig({
      signer: wallet,
      toSign,
    });
  }

  //============= SHIVA ENDPOINTS =============
  /**
   * Will stop the testnet that is being used in the test run.
   */
  async stopTestnet() {
    if (
      this.network === LIT_TESTNET.LOCALCHAIN &&
      this._shivaClient.processEnvs.STOP_TESTNET
    ) {
      await this.testnet.stopTestnet();
    } else {
      console.log('skipping testnet shutdown.');
    }
  }
  //============= END SHIVA ENDPOINTS =============

  /**
   * Sends funds from the current wallet to the specified wallet address.
   * @param walletAddress - The address of the recipient wallet.
   * @param amount - The amount of funds to send (default: '0.001').
   * @throws If there is an error sending the funds.
   */
  getFunds = async (walletAddress: string, amount = '0.001') => {
    try {
      const privateKey = await this.getAvailablePrivateKey();
      const provider = new ethers.providers.JsonRpcBatchProvider(this.rpc);
      const wallet = new ethers.Wallet(privateKey.privateKey, provider);

      const tx = await wallet.sendTransaction({
        to: walletAddress,
        value: ethers.utils.parseEther(amount),
      });

      await tx.wait();
    } catch (e) {
      throw new Error(`Failed to send funds to ${walletAddress}: ${e}`);
    }
  };

  /**
   * Context: the reason this is created instead of individually is because we can't allocate capacity beyond the global
   * max capacity.
   */
  setupSuperCapacityDelegationAuthSig = async () => {
    const privateKey = await this.getAvailablePrivateKey();
    const provider = new ethers.providers.JsonRpcBatchProvider(this.rpc);
    const wallet = new ethers.Wallet(privateKey.privateKey, provider);

    /**
     * ====================================
     * Setup contracts-sdk client
     * ====================================
     */
    if (this.network === LIT_TESTNET.LOCALCHAIN) {
      const networkContext =
        this?.testnet?.ContractContext ?? this._contractContext;
      this.contractsClient = new LitContracts({
        signer: wallet,
        debug: this.processEnvs.DEBUG,
        rpc: this.rpc,
        customContext: networkContext,
      });
    } else if (
      CENTRALISATION_BY_NETWORK[this.network] === 'decentralised' ||
      CENTRALISATION_BY_NETWORK[this.network] === 'centralised'
    ) {
      this.contractsClient = new LitContracts({
        signer: wallet,
        debug: this.processEnvs.DEBUG,
        network: this.network,
      });
    }

    // THE FOLLOWING WILL TECHNICALLY NEVER BE CALLED, BUT IT'S HERE FOR FUTURE REFERENCE FOR SWITCHING WALLETS
    else {
      async function _switchWallet() {
        // TODO: This wallet should be cached somehwere and reused to create delegation signatures.
        // There is a correlation between the number of Capacity Credit NFTs in a wallet and the speed at which nodes can verify a given rate limit authorization. Creating a single wallet to hold all Capacity Credit NFTs improves network performance during tests.
        const capacityCreditWallet =
          ethers.Wallet.createRandom().connect(provider);

        // get wallet balance
        const balance = await wallet.getBalance();
        console.log('this.rpc:', this.rpc);
        console.log('this.wallet.address', wallet.address);
        console.log('Balance:', balance.toString());

        const transferTx = await wallet.sendTransaction({
          to: capacityCreditWallet.address,
          value: ethers.utils.parseEther('0.001'),
        });
        await transferTx.wait();
      }

      // await _switchWallet();

      this.contractsClient = new LitContracts({
        // signer: capacityCreditWallet, // disabled switch wallet for now
        signer: wallet,
        debug: this.processEnvs.DEBUG,
        network: this.network,
      });
    }

    if (!this.contractsClient) {
      console.log('❗️Contracts client not initialized');
      process.exit();
    }

    await this.contractsClient.connect();

    /**
     * ====================================
     * Mint a Capacity Credits NFT and get a capacity delegation authSig with it
     * ====================================
     */
    if (CENTRALISATION_BY_NETWORK[this.network] === 'decentralised') {
      await this.mintSuperCapacityDelegationAuthSig(wallet);
    }
  };

  async mintSuperCapacityDelegationAuthSig(wallet: Signer) {
    console.log(
      '[𐬺🧪 Tinny Environment𐬺] Mint a Capacity Credits NFT and get a capacity delegation authSig with it'
    );

    const capacityTokenId = (
      await this.contractsClient.mintCapacityCreditsNFT({
        requestsPerKilosecond: this.processEnvs.REQUEST_PER_KILOSECOND,
        daysUntilUTCMidnightExpiration: 2,
      })
    ).capacityTokenIdStr;

    try {
      this.superCapacityDelegationAuthSig = (
        await this.litNodeClient.createCapacityDelegationAuthSig({
          dAppOwnerWallet: wallet,
          capacityTokenId: capacityTokenId,
          // Sets a maximum limit of 200 times that the delegation can be used and prevents usage beyond it
          uses: '100000',
        })
      ).capacityDelegationAuthSig;
    } catch (e: any) {
      if (e.message.includes(`Can't allocate capacity beyond the global max`)) {
        console.log('❗️Skipping capacity delegation auth sig setup.', e);
      } else {
        console.log(
          '❗️Error while setting up capacity delegation auth sig',
          e
        );
      }
    }
  }
}
