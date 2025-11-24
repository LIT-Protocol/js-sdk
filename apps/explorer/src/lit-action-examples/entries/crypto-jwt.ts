import type { LitActionExample } from "../types";

const code = String.raw`(async () => {
  // Shim
  const { Buffer: NodeBuffer } = await import('node:buffer');
  globalThis.Buffer = NodeBuffer;

  // Crypto
  const text = 'Hello, crypto world!';
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = Buffer.from(hashArray).toString('base64url');
  console.log(hashBase64);

  // JWT
  const secret = Buffer.from('mysecret', 'utf8');
  const payload = { userId: 123 };

  // sign short-lived token
  const token = jwt.sign(payload, secret, { expiresIn: '2s' });
  console.log("token:", token);

  // header sanity (alg/typ)
  const [hdrB64] = token.split('.');
  const jwtHeader = JSON.parse(Buffer.from(hdrB64, 'base64url').toString('utf8'));
  console.log("jwtHeader:", jwtHeader);

  // verify immediately
  let jwtVerify;
  try {
    jwtVerify = jwt.verify(token, secret);
  } catch (err) {
    jwtVerify = { error: err?.message, name: err?.name };
  }

  console.log("jwtVerify:", jwtVerify);

  // decode (no verify())
  const jwtDecode = jwt.decode(token);
  console.log("jwtDecode:", jwtDecode);

  // verify
  let jwtFail;
  try {
    jwt.verify(token, 'wrongsecret');
  } catch (e) {
    jwtFail = JSON.stringify(e, null, 2);
    console.log("Fail(expected)", JSON.stringify(e, null, 2));
  }

  // set results to JSON so we can parse it as JSON to see:
  const result = {
    hashBase64,
    token,
    jwtHeader,
    jwtVerify,
    jwtDecode,
    jwtFail,
  };

  Lit.Actions.setResponse({
    response: JSON.stringify(
      result,
      null,
      2
    ),
  });
})();`;

export default {
  id: "crypto-jwt",
  title: "Crypto & JWT",
  description:
    "Hashes a string, signs a short-lived JWT, and verifies/decodes it inside a Lit Action runtime.",
  order: 30,
  code,
} satisfies LitActionExample;
