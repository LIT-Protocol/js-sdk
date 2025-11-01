const fs = require('fs');
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

const { litActionRepository, litActionRepositoryCommon } =
  loadLitActionExports();

function renderLitActionRepository(repo) {
  const actionEntries = Object.entries(repo).map(([actionName, networks]) => {
    const networkEntries = Object.entries(networks)
      .map(([networkName, cid]) => `    ${networkName}: '${cid}',`)
      .join('\n');

    return `  ${actionName}: Object.freeze({\n${networkEntries}\n  }),`;
  });

  return `Object.freeze({\n${actionEntries.join('\n')}\n});`;
}

function renderLitActionRepositoryCommon(repo) {
  const commonEntries = Object.entries(repo)
    .map(([actionName, cid]) => `  ${actionName}: '${cid}'`)
    .join(',\n');

  return `Object.freeze({\n${commonEntries}\n});`;
}

function updateConstantsFile(cidRepo, cidRepoCommon) {
  const constantsFilePath = path.resolve(
    __dirname,
    '../wrapped-keys/src/lib/lit-actions-client/constants.ts'
  );

  const fileContents = `import { LitCidRepository, LitCidRepositoryCommon } from './types';

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = ${renderLitActionRepository(
    cidRepo
  )}

const LIT_ACTION_CID_REPOSITORY_COMMON: LitCidRepositoryCommon = ${renderLitActionRepositoryCommon(
    cidRepoCommon
  )}

export { LIT_ACTION_CID_REPOSITORY, LIT_ACTION_CID_REPOSITORY_COMMON };
`;

  fs.writeFileSync(constantsFilePath, fileContents);
}

/** Usage:
 * 1. Ensure you have a valid Pinata IPFS JWT in `LIT_IPFS_JWT` env var
 * 2. Make sure you run the library build (`pnpm nx build wrapped-keys-lit-actions`) so the generated actions are up to date
 * 3. `node sync-actions-to-ipfs` -> this will pin the latest lit actions, update `packages/wrapped-keys/src/lib/lit-actions-client/constants.ts`, and print the CID JSON for verification
 * 4. Review the diff in `constants.ts` and commit the changes
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

  updateConstantsFile(cidRepo, cidRepoCommon);
  console.log(
    'Updated constants file at packages/wrapped-keys/src/lib/lit-actions-client/constants.ts'
  );
  console.log('common', cidRepoCommon);
  console.log('byNetwork', cidRepo);
}

gogo();
