const axios = require('axios');
const FormData = require('form-data');

const {
  litActionRepository,
  litActionRepositoryCommon,
} = require('./dist/src/index');

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
