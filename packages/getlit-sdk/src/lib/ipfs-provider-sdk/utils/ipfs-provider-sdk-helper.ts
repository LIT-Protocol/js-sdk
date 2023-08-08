import { isBrowser, isNode } from '../../utils';

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
