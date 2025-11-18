import type { LitActionExample } from "../types";

const code = String.raw`(async () => {
  const dAppUniqueAuthMethodType = "0x...";
  const { publicKey, username, password, authMethodId } = jsParams;
  
  // Custom validation logic 
  const EXPECTED_USERNAME = 'alice';
  const EXPECTED_PASSWORD = 'lit';
  const userIsValid = username === EXPECTED_USERNAME && password === EXPECTED_PASSWORD;
  
  // Check PKP permissions
  const tokenId = await Lit.Actions.pubkeyToTokenId({ publicKey: publicKey });
  const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({ tokenId });
  
  const isPermitted = permittedAuthMethods.some((permittedAuthMethod) => {
    return permittedAuthMethod["auth_method_type"] === dAppUniqueAuthMethodType && 
           permittedAuthMethod["id"] === authMethodId;
  });
  
  const isValid = isPermitted && userIsValid;
  LitActions.setResponse({ response: isValid ? "true" : "false" });
})();`;

export default {
  id: "custom-auth-check",
  title: "Custom Auth Validation",
  description:
    "Validate username/password, ensure the auth method is permitted, and return a boolean result.",
  order: 20,
  code,
  jsParams: {
    username: "alice",
    password: "lit",
    authMethodId: "example-auth-method",
  },
} satisfies LitActionExample;
