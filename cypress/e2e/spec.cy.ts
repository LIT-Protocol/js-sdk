// @ts-nocheck
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
};
let LitJsSdk: any;

describe('Encrypt and Decrypt String', () => {
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

  it('should check and sign auth message', async () => {
    window = await cy.window();

    // cy.window().then(async (window) => {

    // -- set param
    window.params = { chain: 'ethereum' };

    // -- Click the event
    await cy.get('#LitJsSdk_authBrowser_checkAndSignAuthMessage').click();
    await cy.get('#metamask').click();
    await cy.confirmMetamaskSignatureRequest();
    await cy.wait(100);
    await cy.confirmMetamaskSignatureRequest();
    await cy.wait(100).then(() => {
      console.log('window.output:', window.output);
      savedParams.authSig = JSON.parse(window.output);
      expect(savedParams.authSig).to.be.an('object');
    });
  });

  it('authSig is saved', () => {
    // expect saveParams not empty
    expect(savedParams.authSig).to.be.an('object');
  });

  it('connect lit node client', async () => {
    LitJsSdk = window.LitJsSdk_litNodeClient;

    const client = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' });

    await client.connect();

    savedParams.litNodeClient = client;

    await cy.wait(100).then(() => {
      // expect to have property of executeJs
      expect(savedParams.litNodeClient).to.have.property('executeJs');
    });
  });

  it('encrypts string', async () => {
    const res = await LitJsSdk.encryptString('This test is working! Omg!');
    savedParams.encryptedString = res.encryptedString;
    savedParams.symmetricKey = res.symmetricKey;
    expect(savedParams.encryptedString).to.be.a('Blob');
    expect(savedParams.symmetricKey).to.be.a('Uint8Array');
  });

  it('turns blob to base64 string', async () => {
    const base64 = await LitJsSdk.blobToBase64String(
      savedParams.encryptedString
    );
    savedParams.encryptedString = base64;
    expect(savedParams.encryptedString).to.be.a('string');
  });

  it('saves encryption key', async () => {
    // const { encryptedString, symmetricKey } = savedParams;

    const encryptedSymmetricKey =
      await savedParams.litNodeClient.saveEncryptionKey({
        accessControlConditions: savedParams.accs,
        symmetricKey: savedParams.symmetricKey,
        authSig: savedParams.authSig,
        chain: 'ethereum',
      });

    savedParams.encryptedSymmetricKey = encryptedSymmetricKey;

    expect(savedParams.encryptedSymmetricKey).to.be.an('Uint8Array');
  });

  it('gets toDecrypt by turning encryptedSymmetricKey(uint8array) to string', async () => {
    savedParams.toDecrypt = await LitJsSdk.uint8arrayToString(
      savedParams.encryptedSymmetricKey,
      'base16'
    );
    expect(savedParams.toDecrypt).to.be.a('string');
  });

  it('gets encryption key', async () => {
    const encryptionKey = await savedParams.litNodeClient.getEncryptionKey({
      accessControlConditions: savedParams.accs,
      toDecrypt: savedParams.toDecrypt,
      authSig: savedParams.authSig,
      chain: 'ethereum',
    });

    savedParams.encryptionKey = encryptionKey;

    expect(savedParams.encryptionKey).to.be.a('Uint8Array');
  });

  it('turns base64 to Blob', async () => {
    const blob = await LitJsSdk.base64StringToBlob(savedParams.encryptedString);
    savedParams.encryptedStringBlob = blob;
    expect(savedParams.encryptedStringBlob).to.be.a('Blob');
  });

  it('decrypts string', async () => {
    const decryptedString = await LitJsSdk.decryptString(
      savedParams.encryptedStringBlob,
      savedParams.encryptionKey
    );
    expect(decryptedString).to.eq('This test is working! Omg!');
  });
});

describe('Zip and encrypt string then decrypt zip', () => {
  it('zips string', async () => {
    const zip = await LitJsSdk.zipAndEncryptString(
      'This test is working! Omg!'
    );
    savedParams.zip = zip;
    expect(savedParams.zip.symmetricKey).to.be.a('Uint8Array');
    expect(savedParams.zip.encryptedZip).to.be.a('Blob');
  });

  it('saves encryption key', async () => {
    const encryptedSymmetricKey =
      await savedParams.litNodeClient.saveEncryptionKey({
        accessControlConditions: savedParams.accs,
        symmetricKey: savedParams.zip.symmetricKey,
        authSig: savedParams.authSig,
        chain: 'ethereum',
      });

    savedParams.encryptedSymmetricKey = encryptedSymmetricKey;

    expect(savedParams.encryptedSymmetricKey).to.be.an('Uint8Array');
  });

  it('gets encryption key', async () => {
    const toDecrypt = await LitJsSdk.uint8arrayToString(
      savedParams.encryptedSymmetricKey,
      'base16'
    );

    const encryptionKey = await savedParams.litNodeClient.getEncryptionKey({
      accessControlConditions: savedParams.accs,
      toDecrypt,
      authSig: savedParams.authSig,
      chain: 'ethereum',
    });

    savedParams.encryptionKey = encryptionKey;

    expect(savedParams.encryptionKey).to.be.a('Uint8Array');
  });

  it('decrypt zip', async () => {
    const decryptedZip = await LitJsSdk.decryptZip(
      savedParams.zip.encryptedZip,
      savedParams.encryptionKey
    );

    savedParams.decryptZip = decryptedZip;
    expect(savedParams.decryptZip).to.be.an('Object');
  });

  it('gets the decrypted zip content', async () => {
    const decryptedString = await savedParams.decryptZip['string.txt'].async(
      'text'
    );
    expect(decryptedString).to.eq('This test is working! Omg!');
  });
});

describe('Encrypt and decrypt file', () => {
  it('zip and encrypt files', async () => {
    // create a new file
    const file = new File(['Hello, world!'], 'hello.txt', {
      type: 'text/plain',
    });

    savedParams.zipFiles = await LitJsSdk.zipAndEncryptFiles([file]);

    expect(savedParams.zipFiles.symmetricKey).to.be.a('Uint8Array');
  });

  it('turns blob to base 64 string', async () => {
    const base64 = await LitJsSdk.blobToBase64String(
      savedParams.zipFiles.encryptedZip
    );
    savedParams.encryptedZipBase64 = base64;
    expect(savedParams.encryptedZipBase64).to.be.a('string');
  });

  it('saves encryption key', async () => {
    const encryptedSymmetricKey =
      await savedParams.litNodeClient.saveEncryptionKey({
        accessControlConditions: savedParams.accs,
        symmetricKey: savedParams.zipFiles.symmetricKey,
        authSig: savedParams.authSig,
        chain: 'ethereum',
      });

    savedParams.encryptedSymmetricKey = encryptedSymmetricKey;

    expect(savedParams.encryptedSymmetricKey).to.be.an('Uint8Array');
  });

  it('gets encryption key', async () => {
    const toDecrypt = await LitJsSdk.uint8arrayToString(
      savedParams.encryptedSymmetricKey,
      'base16'
    );

    const encryptionKey = await savedParams.litNodeClient.getEncryptionKey({
      accessControlConditions: savedParams.accs,
      toDecrypt,
      authSig: savedParams.authSig,
      chain: 'ethereum',
    });

    savedParams.encryptionKey = encryptionKey;

    expect(savedParams.encryptionKey).to.be.a('Uint8Array');
  });

  it('decrypt file', async () => {
    const blob = LitJsSdk.base64StringToBlob(savedParams.encryptedZipBase64);

    const decryptedZip = await LitJsSdk.decryptFile({
      file: blob,
      symmetricKey: savedParams.encryptionKey,
    });

    savedParams.decryptZip = decryptedZip;

    // turn uint8array into string
    const decryptedFile = await LitJsSdk.uint8arrayToString(decryptedZip);

    expect(decryptedFile).to.contains('Hello, world!');
  });
});

describe('Encrypt and zip metadata', () => {
  it('encrypts file and zips with metadata', async () => {
    const file = new File(['Hello, world!'], 'hello.txt', {
      type: 'text/plain',
    });
    const { zipBlob } = await LitJsSdk.encryptFileAndZipWithMetadata({
      file,
      accessControlConditions: savedParams.accs,
      authSig: savedParams.authSig,
      chain: 'ethereum',
      litNodeClient: savedParams.litNodeClient,
      readme: 'this is a test',
    });

    savedParams.zipBlob = zipBlob;
    expect(savedParams.zipBlob).to.be.a('Blob');
  });

  it('turns blob to base64 string', async () => {
    const base64 = await LitJsSdk.blobToBase64String(savedParams.zipBlob);
    savedParams.zipBlobBase64 = base64;
    expect(savedParams.zipBlobBase64).to.be.a('string');
  });

  it('decrypts zip file with metadata', async () => {
    const file = LitJsSdk.base64StringToBlob(savedParams.zipBlobBase64);

    const { decryptedFile } = await LitJsSdk.decryptZipFileWithMetadata({
      authSig: savedParams.authSig,
      litNodeClient: savedParams.litNodeClient,
      file,
    });

    const decryptedFileString = await LitJsSdk.uint8arrayToString(
      decryptedFile
    );

    expect(decryptedFileString).to.contains('Hello, world!');
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

    const reqBody = await savedParams.litNodeClient.getLitActionRequestBody(params);

    const res = await savedParams.litNodeClient.getJsExecutionShares(
      'https://serrano.litgateway.com:7379',
      reqBody
    );

    expect(res).to.have.property('logs').and.contains('Hello World!');
  });
});

// how many doubles to make a million
// const doubles = Math.log(1000000) / Math.log(2);
