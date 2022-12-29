// -- ceramic
import { CeramicClient } from '@ceramicnetwork/http-client';
import { authenticateCeramic, createDocument } from './ceramic-helper.js';

// -- lit
import { LitNodeClient } from '@lit-protocol/lit-node-client';

// -- this server
import express from 'express';
import bodyparser from 'body-parser';

const app = express();
const router = express.Router();

// -------------------------
//          Cache
// -------------------------
let litNodeClient;
let ceramic;
const SEED = 'a8c6322d6a0caaf5cc62c242574a123d96f1fd22a4030120eb38f65df128abf1';
const SIZE_LIMIT = '1024kb'; // 1mb hard limit

// --------------------------------
//          Server Setup
// --------------------------------
(async () => {
  // -- connect lit node client
  litNodeClient = new LitNodeClient({
    litNetwork: 'serrano',
    debug: false,
  });

  await litNodeClient.connect();

  // -- seed
  const seedBuffer = Buffer.from(SEED, 'hex');

  // -- connect ceramic
  ceramic = new CeramicClient('https://ceramic-clay.3boxlabs.com');
  await authenticateCeramic(seedBuffer);
})();

const serverReady = () => {
  return litNodeClient !== null && litNodeClient !== undefined;
};

// ---------------------------------
//          Configuration
// ---------------------------------
app.use(bodyparser.urlencoded({ extended: false, limit: SIZE_LIMIT }));
app.use(bodyparser.json({ limit: SIZE_LIMIT, type: 'application/json' }));
app.use('/', router);

// --------------------------------
//          Get Requests
// --------------------------------
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to be-lit-actions-event-listener!' });
});

// ---------------------------------
//          Post Requests
// ---------------------------------
router.post('/api/register', async (req, res) => {
  console.log('Registering...');

  if (!serverReady()) {
    res.status(500).send({ message: 'Server is not ready' });
    return;
  }

  const code = req.body.code;
  const jsParams = JSON.parse(req.body.jsParams);
  const authSig = req.body.authSig;

  // -- try to run the register action without any parameters
  try {
    await litNodeClient.executeJs({
      authSig,
      code,
      jsParams,
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }

  // -- try to create a document on ceramic
  let doc;
  try {
    doc = await createDocument({ code, jsParams });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }

  res.status(200).send({ message: doc.toString() });
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });

server.on('error', console.error);
