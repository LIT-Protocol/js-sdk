import type { LitActionExample } from "../types";

const code = String.raw`const { sigName, toSign, publicKey, } = jsParams;
const { keccak256, arrayify } = ethers.utils;

(async () => {
  const toSignBytes = new TextEncoder().encode(toSign);
  const toSignBytes32 = keccak256(toSignBytes);
  const toSignBytes32Array = arrayify(toSignBytes32);
  
  await Lit.Actions.signEcdsa({
    toSign: toSignBytes32Array,
    publicKey,
    sigName,
  });  
})();`;

export default {
  id: "sign-basic",
  title: "Sign Message",
  description: "Hash a string and sign it with your PKP using ECDSA.",
  order: 10,
  code,
  jsParams: {
    sigName: "sig1",
    toSign: "Hello from Lit Action",
  },
} satisfies LitActionExample;
