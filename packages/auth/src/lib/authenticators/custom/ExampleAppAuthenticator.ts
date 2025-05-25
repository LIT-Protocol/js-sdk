// This authenticator is what is provided by the dApp owner for the users as their "SDK"
// Hardcoded and public static values are used by the user
export class ExampleAppAuthenticator {
  // [❗️REQUIRED] The unique authMethodType for this authenticator
  public static readonly AUTH_METHOD_TYPE =
    '0x22b562b86d5d467a9f06c3f20137b37ed13981f63bd5dbdf6fc1e0fb97015401';

  // [❗️REQUIRED] Validation IPFS CID (This is the IPFS CID of the validation code)
  // https://explorer.litprotocol.com/ipfs/QmYLeVmwJPVs7Uebk85YdVPivMyrvoeKR6X37kyVRZUXW4
  public static readonly VALIDATION_CID =
    'QmYLeVmwJPVs7Uebk85YdVPivMyrvoeKR6X37kyVRZUXW4';

  // Validation code
  public static readonly VALIDATION_CODE = `(async () => {

  // 1. Set your unique authMethodType eg. keccak256(toBytes("<your_unique_app_name>"))
  const dAppUniqueAuthMethodType = "0x22b562b86d5d467a9f06c3f20137b37ed13981f63bd5dbdf6fc1e0fb97015401";
  
  // 2. Get the params from jsParams
  const { pkpPublicKey, username, password, authMethodId } = jsParams;
  
  // 3. Validate the user with your IdP provider.
  // In a real-life scenario, you would make a fetch request to your IdP provider to validate the user.
  const EXPECTED_USERNAME = 'alice';
  const EXPECTED_PASSWORD = 'lit';

  const userIsValid = username === EXPECTED_USERNAME && password === EXPECTED_PASSWORD;

  // 4. Auth Method Validation
  const tokenId = await Lit.Actions.pubkeyToTokenId({ publicKey: pkpPublicKey });

  const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({ tokenId });

  const isPermitted = permittedAuthMethods.some((permittedAuthMethod) => {
    if (permittedAuthMethod["auth_method_type"] === dAppUniqueAuthMethodType && 
      permittedAuthMethod["id"] === authMethodId) {
    return true;
    }
    return false;
  });

  const isValid = isPermitted && userIsValid;

  // 5. return
  LitActions.setResponse({ response: isValid ? "true" : "false" });
})();`;
}
