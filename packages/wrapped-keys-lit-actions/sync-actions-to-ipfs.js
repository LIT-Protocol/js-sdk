const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

function loadLitActionExports() {
  const candidates = [
    path.resolve(
      __dirname,
      '../../dist/packages/wrapped-keys-lit-actions/src/index.js'
    ),
    path.resolve(
      __dirname,
      '../../dist/out-tsc/packages/wrapped-keys-lit-actions/src/index.js'
    ),
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
    }
  }

  throw new Error(
    'Unable to locate built Lit action exports. Please build the package first (e.g. `pnpm nx build wrapped-keys-lit-actions`).'
  );
}

const {
  litActionRepository,
  litActionRepositoryCommon,
} = loadLitActionExports();

/** Usage:
 * 1. Ensure you have a valid Pinata IPFS JWT in `LIT_IPFS_JWT` env var
 * 2. Make sure you run `yarn build` to ensure that all LIT actions code has been built into the generated directory from the current commit
 * 3. `node sync-actions-to-ipfs` -> this will print out JSON of the `LIT_ACTION_CID_REPOSITORY` and LIT_ACTION_CID_REPOSITORY_COMMON
 * 4. Copy/paste the CIDs into those objects in `packages/wrapped-keys/src/lib/lit-actions-client/constants.ts`
 * 5. Commit the changes and push them to your branch
 */

const JWT = process.env.LIT_IPFS_JWT || '';
if (!JWT) {
  throw new Error('Missing Pinata IPFS JWT in LIT_IPFS_JWT env variable');
}

async function pinFileToIPFS(actionName, code) {
  const formData = new FormData();
  formData.append('file', Buffer.from(code), { filename: actionName + '.js' });

  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name: 'File name',
    })
  );

  formData.append(
    'pinataOptions',
    JSON.stringify({
      cidVersion: 0,
    })
  );

  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${JWT}`,
      },
    }
  );

  console.log(actionName, res.data.IpfsHash);
  return res.data.IpfsHash;
}

async function getCidRepository(codeRepository) {
  const cidRepository = {};

  await Promise.all(
    Object.entries(codeRepository).map(([actionName, byNetworkObj]) => {
      cidRepository[actionName] = {};

      return Promise.all(
        Object.entries(byNetworkObj).map(async ([networkName, codeStr]) => {
          console.log('setting', actionName, networkName, codeStr.length);

          cidRepository[actionName][networkName] = await pinFileToIPFS(
            actionName,
            codeStr
          );
        })
      );
    })
  );

  return cidRepository;
}

async function getCidRepositoryCommon(codeRepository) {
  const cidRepository = {};

  await Promise.all(
    Object.entries(codeRepository).map(async ([actionName, codeStr]) => {
      console.log('setting common', actionName, codeStr.length);
      cidRepository[actionName] = await pinFileToIPFS(actionName, codeStr);
    })
  );

  return cidRepository;
}

async function gogo() {
  const [cidRepoCommon, cidRepo] = await Promise.all([
    getCidRepositoryCommon(litActionRepositoryCommon),
    getCidRepository(litActionRepository),
  ]);

  console.log('common', cidRepoCommon);
  console.log('byNetwork', cidRepo);
}

gogo();
