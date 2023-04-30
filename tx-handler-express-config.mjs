import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

const txHandler = express();
txHandler.use(bodyParser.json());

// Create a queue to store incoming requests
const queue = [];

// Process the next item in the queue
async function processNext() {
  if (queue.length > 0) {
    const { req, res } = queue.shift();

    // Process the request
    try {
      const result = await processRequest(req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

// Function to process the request (simulate a long-running operation)
async function processRequest(data) {
  return new Promise(async (resolve) => {
    // wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    resolve(`Processed: ${data.data}`);
  });
}

// API endpoint
txHandler.post('/process', (req, res) => {
  console.log('Tasks queue: ' + queue.length);
  console.log('-----');
  console.log('Start: ' + req.body.data);

  // Add the request to the queue
  queue.push({ req, res });
});

// API endpoint to wait until the queue is empty
txHandler.get('/wait-until-empty', async (req, res) => {
  console.log('waiting...');
  // Wait for the queue to become empty
  await new Promise((resolve) => {
    console.log('queue.length: ' + queue.length);
    const interval = setInterval(() => {
      if (queue.length <= 1) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  console.log('queue is empty');
  // Send a response when the queue is empty
  res.json({ success: true, message: 'The queue is empty.' });
});

// Resolve endpoint
txHandler.post('/resolve', (_req, res) => {
  console.log('resolve: ' + _req.body.data);
  processNext();
  res.json({ success: true, message: 'Processing the next item in the queue' });
});

// create a 'status' endpoint to return when the server is up
txHandler.get('/status', (_req, res) => {
  res.json({ success: true, message: 'The server is up and running.' });
});

async function waitTx(server, data = 'tx') {
  return await request(server).post('/process').send({ data });
}

async function waitUntilEmpty(server) {
  return await request(server).get('/wait-until-empty').send();
}

async function resolveTx(server) {
  return await request(server).post('/resolve').send();
}

function useTxHandler(server) {
  server = express();
  server.use(bodyParser.json());
  server.use(txHandler);
  return server;
}

async function processTx(server, description, callback) {
  waitTx(server, description);
  await waitUntilEmpty(server);
  const res = await callback();
  await resolveTx(server);
  return res;
}

export {
  txHandler,
  waitTx,
  useTxHandler,
  resolveTx,
  waitUntilEmpty,
  processTx,
};

// run the server at port 3031
txHandler.listen(3031, () => console.log('Listening on port 3031'));
