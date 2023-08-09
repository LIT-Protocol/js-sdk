import { isBrowser, isNode, log } from '../../utils';

export const createPayload = (serialisedData: string) => {
  let payload;
  const boundary = '---------------------------' + Date.now().toString(16); // Generate a unique boundary

  if (isNode()) {
    const { Readable } = require('stream');
    const buffer = Buffer.from(serialisedData, 'utf8');
    const stream = Readable.from(buffer);
    stream.path = 'string.txt';

    payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="string.txt"\r\nContent-Type: text/plain\r\n\r\n${buffer.toString()}\r\n--${boundary}--\r\n`;
  }

  if (isBrowser()) {
    const buffer = new TextEncoder().encode(serialisedData);

    payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="string.txt"\r\nContent-Type: text/plain\r\n\r\n${new TextDecoder().decode(
      buffer
    )}\r\n--${boundary}--\r\n`;
  }

  if (!payload) {
    throw new Error('Payload is undefined');
  }

  return { payload, boundary };
};

export const fetchIPFSContent = async (immutableAddress: string) => {
  // fetch the content from https://ipfs.io/ipfs/${immutableAddress}
  let res;

  try {
    res = await fetch(`https://ipfs.io/ipfs/${immutableAddress}`);
  } catch (e) {
    log.throw('fetchIPFSContent - get', e);
  }

  // -- check status
  if (res.status !== 200) {
    log.throw(
      `fetchIPFSContent - get - status: ${res.status} - ${res.statusText}`
    );
  }

  const contentType = res.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return data;
};
