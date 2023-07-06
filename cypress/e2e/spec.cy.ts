// @ts-nocheck

import {
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import { uint8arrayFromString, uint8arrayToString } from '@lit-protocol/uint8arrays';

let window: any;
let savedParams: any = {
  accs: [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '0',
      },
    },
  ],
  authSig: null,
};
let LitJsSdk: any;

describe('Auth + Setup', () => {
  // -- before
  before(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.disableIntercom = true;
      },
    });
    cy.setupMetamask(
      'shuffle stay hair student wagon senior problem drama parrot creek enact pluck',
      'goerli',
      'Testing!23'
    );
  });

  it('should check and sign auth message', () => {
    cy.window().then(async (window) => {
      window.params = { chain: 'ethereum' };
      cy.get('#LitJsSdk_authBrowser_checkAndSignAuthMessage')
        .click()
        .then(() => {
          cy.get('#metamask')
            .click()
            .then(() => {
              cy.confirmMetamaskSignatureRequest().then(() => {
                cy.wait(100).then(() => {
                  console.log('window.output:', window.output);
                  savedParams.authSig = window.output;
                  LitJsSdk = window.LitJsSdk_litNodeClient;
                  expect(savedParams.authSig).to.be.an('object');
                });
              });
            });
        });
    });
  });

  it('authSig is saved', () => {
    // expect saveParams not empty
    expect(savedParams.authSig).to.be.an('object');
  });

  it('connect lit node client', () => {
    cy.window().then(async () => {
      const client = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' });
      await client.connect();
      savedParams.litNodeClient = client;
      expect(client.config.litNetwork).to.be.eq('serrano');
    });
  });
});

describe('Encrypt and Decrypt', () => {
  it('encrypts', async () => {
    cy.window().then(async () => {
      const encryptResponse = await savedParams.litNodeClient.encrypt({
        accessControlConditions: savedParams.accs,
        authSig: savedParams.authSig,
        chain: 'ethereum',
        dataToEncrypt: uint8arrayFromString('This test is working! Omg!', 'base16'),
      })
      savedParams.encryptResponse = encryptResponse;
      
      const { ciphertext, dataToEncryptHash } = encryptResponse;
      expect(ciphertext).to.be.an('string');
      expect(dataToEncryptHash).to.be.an('string');
    })
  });

  it('decrypts', async () => {
    cy.window().then(async () => {
      const decryptResponse = await savedParams.litNodeClient.decrypt({
        accessControlConditions: savedParams.accs,
        authSig: savedParams.authSig,
        chain: 'ethereum',
        ciphertext: savedParams.encryptResponse.ciphertext,
        dataToEncryptHash: savedParams.encryptResponse.dataToEncryptHash,
      });
      savedParams.decryptResponse = decryptResponse;
  
      expect(savedParams.decryptResponse.decryptedData).to.be.a('Uint8Array');
      expect(uint8arrayToString(savedParams.decryptResponse.decryptedData, 'base16')).to.be.eq('This test is working! Omg!');
    });
  });
})

describe('Encrypt and Decrypt String', () => {
  it('encrypts string', async () => {
    cy.window().then(async () => {
      const encryptResponse = await LitJsSdk.encryptString(
        {
          dataToEncrypt: 'this is a secret message',
          accessControlConditions: savedParams.accs,
          chain: 'ethereum',
          authSig: savedParams.authSig,
        },
        savedParams.litNodeClient,
      );
      savedParams.encryptResponse = encryptResponse;
  
      const { ciphertext, dataToEncryptHash } = encryptResponse;
      expect(ciphertext).to.be.an('string');
      expect(dataToEncryptHash).to.be.an('string');
    });
  });

  it('decrypts string', async () => {
    cy.window().then(async () => {
      const decryptedString = await LitJsSdk.decryptToString(
        {
          accessControlConditions: savedParams.accs,
          chain: 'ethereum',
          authSig: savedParams.authSig,
          ciphertext: savedParams.encryptResponse.ciphertext,
          dataToEncryptHash: savedParams.encryptResponse.dataToEncryptHash,
        },
        savedParams.litNodeClient,
      );
  
      expect(decryptedString).to.be.eq('this is a secret message');
    });
  });
});

describe('Zip and encrypt string then decrypt zip', () => {
  it('zips and encrypt string', async () => {
    cy.window().then(async () => {
      const encryptResponse = await LitJsSdk.zipAndEncryptString(
        {
          dataToEncrypt: 'this is a secret message',
          accessControlConditions: savedParams.accs,
          chain: 'ethereum',
          authSig: savedParams.authSig,
        },
        savedParams.litNodeClient,
      );
      const { ciphertext, dataToEncryptHash } = encryptResponse;
      savedParams.encryptResponse = encryptResponse;
  
      expect(ciphertext).to.be.an('string');
      expect(dataToEncryptHash).to.be.an('string');
    });
  });

  it('decrypts into zip', async () => {
    cy.window().then(async () => {
      const decryptedFiles = await LitJsSdk.decryptToZip(
        {
          accessControlConditions: savedParams.accs,
          chain: 'ethereum',
          authSig: savedParams.authSig,
          ciphertext: savedParams.encryptResponse.ciphertext,
          dataToEncryptHash: savedParams.encryptResponse.dataToEncryptHash,
        },
        savedParams.litNodeClient,
      );
  
      expect(decryptedFiles).to.be.an('array');
      const decryptedString = await decryptedFiles['string.txt'].async(
        'text'
      );
      expect(decryptedString).to.eq('this is a secret message');
    });
  });
});

describe('Encrypt and decrypt file', () => {
  it('zip and encrypt files', async () => {
    cy.window().then(async () => {
      // create a new file
      const file = new File(['Hello, world!'], 'hello.txt', {
        type: 'text/plain',
      });
  
      const encryptResponse = await LitJsSdk.zipAndEncryptFiles(
        [file],
        {
          accessControlConditions: savedParams.accs,
          authSig: {
            ethereum: ethAuthSig,
          },
        },
        savedParams.litNodeClient,
      );
      savedParams.encryptResponse = encryptResponse;
  
      const { ciphertext, dataToEncryptHash } = encryptResponse;
      expect(ciphertext).to.be.an('string');
      expect(dataToEncryptHash).to.be.an('string');
    });
  });

  it('decrypts into zip', async () => {
    cy.window().then(async () => {
      const decryptedFiles = await LitJsSdk.decryptToZip(
        {
          accessControlConditions: savedParams.accs,
          authSig: {
            ethereum: ethAuthSig,
          },
          ciphertext,
          dataToEncryptHash,
        },
        savedParams.litNodeClient,
      );
  
      expect(decryptedFiles).to.be.an('array');
      const decryptedFile = await decryptedFiles['hello.txt'].async(
        'text'
      );
  
      const decryptedFileContents = await LitJsSdk.uint8arrayToString(
        decryptedFile
      );
  
      expect(decryptedFileContents).to.eq('Hello, world!');
    });
  });
});

describe('Lit Action', () => {
  it('Gets JS execution shares', async () => {
    const litActionCode = `
        (async () => {
          console.log("Hello World!");
        })();
        `;

    const params = {
      authSig: savedParams.authSig,
      jsParams: {},
      code: litActionCode,
    };

    const reqBody = await savedParams.litNodeClient.getLitActionRequestBody(
      params
    );

    const res = await savedParams.litNodeClient.getJsExecutionShares(
      'https://serrano.litgateway.com:7379',
      reqBody
    );

    expect(res).to.have.property('logs').and.contains('Hello World!');
  });

  it('Gets JS execution shared for IPFS code', async () => {
    const ipfsId = 'QmTLZxMgjHoZiNZyGnS4CXjSjbpZSnie3y32HoqK1ykmkW';

    const params = {
      authSig: savedParams.authSig,
      jsParams: {},
      ipfsId,
    };

    const reqBody = await savedParams.litNodeClient.getLitActionRequestBody(
      params
    );
    const res = await savedParams.litNodeClient.getJsExecutionShares(
      'https://serrano.litgateway.com:7379',
      reqBody
    );

    // expect JSON.parse(res.response)['Lit.Auth'] to contain the IPFS code in the array
    const litAuth = JSON.parse(res.response)['Lit.Auth'];
    const keys = Object.keys(litAuth);

    expect(keys).to.contain('actionIpfsIds');

    expect(litAuth.actionIpfsIds).to.contain(ipfsId);
  });

  it('Gets JWT params', () => {
    const jwtParams = savedParams.litNodeClient.getJWTParams();

    expect(jwtParams).to.have.property('exp').and.to.be.a('number');
    expect(jwtParams).to.have.property('iat').and.to.be.a('number');
  });

  it('Format accessControlConditions', () => {
    const { iat, exp } = savedParams.litNodeClient.getJWTParams();
    const params = {
      accessControlConditions: savedParams.accs,
      chain: 'ethereum',
      authSig: savedParams.authSig,
      iat,
      exp,
    };
    const formattedAcc =
      savedParams.litNodeClient.getFormattedAccessControlConditions(params);
    expect(formattedAcc).to.have.property('error').and.equal(false);
    const acc = [
      // should be same as savedParams.accs
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',
        },
      },
    ];
    expect(formattedAcc)
      .to.have.property('formattedAccessControlConditions')
      .and.deep.members(acc);
  });

  it('Format evmContractConditions', () => {
    const evmContractConditions = [
      {
        contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
        functionName: 'balanceOf',
        functionParams: [':userAddress', '8'],
        functionAbi: {
          type: 'function',
          stateMutability: 'view',
          outputs: [
            {
              type: 'uint256',
              name: '',
              internalType: 'uint256',
            },
          ],
          name: 'balanceOf',
          inputs: [
            {
              type: 'address',
              name: 'account',
              internalType: 'address',
            },
            {
              type: 'uint256',
              name: 'id',
              internalType: 'uint256',
            },
          ],
        },
        chain: 'mumbai',
        returnValueTest: {
          key: '',
          comparator: '>',
          value: '0',
        },
      },
    ];

    const exptectedEvmContractConditions = [
      {
        contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
        functionName: 'balanceOf',
        functionParams: [':userAddress', '8'],
        functionAbi: {
          // type: "function",
          constant: false,
          stateMutability: 'view',
          outputs: [
            {
              type: 'uint256',
              name: '',
              // internalType: "uint256",
            },
          ],
          name: 'balanceOf',
          inputs: [
            {
              type: 'address',
              name: 'account',
              // internalType: "address",
            },
            {
              type: 'uint256',
              name: 'id',
              // internalType: "uint256",
            },
          ],
        },
        chain: 'mumbai',
        returnValueTest: {
          key: '',
          comparator: '>',
          value: '0',
        },
      },
    ];

    const { iat, exp } = savedParams.litNodeClient.getJWTParams();
    const params = {
      evmContractConditions,
      chain: 'mumbai',
      authSig: savedParams.authSig,
      iat,
      exp,
    };
    const formattedEvmConditions =
      savedParams.litNodeClient.getFormattedAccessControlConditions(params);
    expect(formattedEvmConditions).to.have.property('error').and.equal(false);
    expect(formattedEvmConditions)
      .to.have.property('formattedEVMContractConditions')
      .and.deep.members(exptectedEvmContractConditions);
  });

  it('Format solRpcConditions', async () => {
    const solRpcConditions = [
      {
        method: 'getBalance',
        params: [':userAddress'],
        pdaParams: [],
        pdaInterface: { offset: 0, fields: {} },
        pdaKey: '',
        chain: 'solana',
        returnValueTest: {
          key: '',
          comparator: '>=',
          value: '100000000', // equals 0.1 SOL
        },
      },
    ];

    const expectedHashArray = [
      -914009333, -1738606745, 413792910, 1300522606, 917018267, -1524535853,
      1804555918, -1453561713,
    ];

    const { iat, exp } = savedParams.litNodeClient.getJWTParams();
    const params = {
      solRpcConditions,
      chain: 'solana',
      authSig: savedParams.authSig,
      iat,
      exp,
    };
    const formattedSolConditions =
      await savedParams.litNodeClient.getHashedAccessControlConditions(params);
    const hashArray = Array.from(new Int32Array(formattedSolConditions));
    expect(hashArray).to.have.all.members(expectedHashArray);
  });

  it('Handle node promises', async () => {
    const litActionCode = `
        (async () => {
          console.log("Hello World!");
        })();
        `;

    const params = {
      authSig: savedParams.authSig,
      jsParams: {},
      code: litActionCode,
    };

    const reqBody = await savedParams.litNodeClient.getLitActionRequestBody(
      params
    );

    const nodePromises = savedParams.litNodeClient.getNodePromises(
      (url: string) => {
        return savedParams.litNodeClient.getJsExecutionShares(url, reqBody);
      }
    );

    expect(nodePromises.length).to.equal(10);

    // should be serrano.litgateway
    // const resolvedPromises = savedParams.litNodeClient.handleNodePromises(nodePromises);
    // console.log(resolvedPromises);
  });

  it('Throw Node Error', () => {
    const res: RejectedNodePromises = {
      success: false,
      error: {
        errorCode: 'not_authorized',
      },
    };
    try {
      savedParams.litNodeClient._throwNodeError(res);
    } catch (error) {
      console.log(error);
      expect(error).to.have.property('errorCode', 'NodeNotAuthorized');
    }
  });

  it('Parse Response', () => {
    const jsonString = '{"result":true, "count":42}';
    const res = savedParams.litNodeClient.parseResponses(jsonString);
    expect(res).to.have.property('result', true);
    expect(res).to.have.property('count', 42);
  });

  it('Send command to node', async () => {
    const params: ExecuteJsProps = {
      authSig: savedParams.authSig,
      jsParams: {},
      code: "console.log('Hi Wind!')",
      debug: true,
    };
    const data: JsonExecutionRequest =
      savedParams.litNodeClient.getLitActionRequestBody(params);
    const reqBody: SendNodeCommand = {
      url: 'https://serrano.litgateway.com:7371/web/execute',
      data,
    };
    const res = await savedParams.litNodeClient.sendCommandToNode(reqBody);
    expect(res).to.have.property('success', true);
  });

  it('Handshake with Sgx', async () => {
    const params: HandshakeWithSgx = {
      url: 'https://serrano.litgateway.com:7371',
    };
    const res = await savedParams.litNodeClient.handshakeWithSgx(params);
    expect(res).to.have.keys(
      'clientSdkVersion',
      'networkPublicKey',
      'networkPublicKeySet',
      'serverPublicKey',
      'subnetPublicKey'
    );
  });
});

describe('Session', () => {
  it('hashes a resource id', async () => {
    window = await cy.window();

    const path = '/bglyaysu8rvblxlk7x0ksn';

    let resourceId = {
      baseUrl: 'my-dynamic-content-server.com',
      path,
      orgId: '',
      role: '',
      extraData: '',
    };

    savedParams.hashedResourceId =
      await window.LitJsSdk_accessControlConditions.hashResourceIdForSigning(
        resourceId
      );

    expect(savedParams.hashedResourceId).to.be.eq(
      'd3b7c933579ff8cce79a9db8f135cf93d8e4b1d206129cbe28405ed81dad7cb1'
    );
  });

  it('gets session key', () => {
    let sessionKey = savedParams.litNodeClient.getSessionKey();

    // sessionKey has 'publicKey' property
    expect(sessionKey).to.have.property('publicKey');
  });

  it('gets capabilities', async () => {
    const path = '/bglyaysu8rvblxlk7x0ksn';

    let resourceId = {
      baseUrl: 'my-dynamic-content-server.com',
      path,
      orgId: '',
      role: '',
      extraData: '',
    };

    let hashedResourceId =
      await window.LitJsSdk_accessControlConditions.hashResourceIdForSigning(
        resourceId
      );

    const litResource = new LitAccessControlConditionResource(hashedResourceId);

    let sessionCapabilityObject =
      savedParams.litNodeClient.generateSessionCapabilityObjectWithWildcards([
        litResource,
      ]);
    expect(sessionCapabilityObject.attenuations).to.deep.equal({
      [`lit-accesscontrolcondition://${hashedResourceId}`]: {
        '*/*': [{}],
      },
    });
    expect(
      sessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    );
  });

  it('gets expiration', () => {
    const expiration = savedParams.litNodeClient.getExpiration();

    // expect expiration to contains 'T'
    expect(expiration).to.contains('T');
  });

  it('gets session signatures', async () => {
    const path = '/bglyaysu8rvblxlk7x0ksn';

    let resourceId = {
      baseUrl: 'my-dynamic-content-server.com',
      path,
      orgId: '',
      role: '',
      extraData: '',
    };

    let hashedResourceId =
      await window.LitJsSdk_accessControlConditions.hashResourceIdForSigning(
        resourceId
      );

    const litResource = new LitAccessControlConditionResource(hashedResourceId);

    // no await to simulate click event
    let sessionSigs = savedParams.litNodeClient.getSessionSigs({
      chain: 'ethereum',
      resourceAbilityRequests: [
        {
          resource: litResource,
          ability: LitAbility.AccessControlConditionSigning,
        },
      ],
    });

    await cy.wait(500);
    await cy.get('#metamask').click();
    await cy.confirmMetamaskSignatureRequest();
    await cy.wait(100);
    await cy.confirmMetamaskSignatureRequest();
    sessionSigs = await sessionSigs;

    // expect sessionSigs is an object and its lenght is more than 5 and each of the item in the object has property of 'sig', 'derivedVia', 'signedMessage', 'address', and 'algo'
    expect(sessionSigs).to.be.an('object');
    expect(Object.values(sessionSigs)).to.have.lengthOf.above(5);

    Object.entries(sessionSigs).forEach((item, i) => {
      expect(item[1]).to.have.property('sig');
      expect(item[1]).to.have.property('derivedVia');
      expect(item[1]).to.have.property('signedMessage');
      expect(item[1]).to.have.property('address');
      expect(item[1]).to.have.property('algo');
    });
  });
});
