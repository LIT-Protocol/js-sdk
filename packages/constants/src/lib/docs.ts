export const DOCS = {
  WHAT_IS_AUTH_CONTEXT: `This AuthContext uses a session-based authentication system that requires minting through a relayer. The relayer uses its private key to mint a PKP (Programmable Key Pair) and register your authentication methods.

        When 'sendPkpToItself' is enabled when calling the "mintNextAndAddAuthMethods" function, the minter (msg.sender) does not automatically gain control over the PKP simply by being the minter.

        Control over the PKP's signing capabilities depends on the minting configuration:
        - If the minter's address is not in permittedAddresses and no permittedAuthMethod they control was added, they will lose control over the PKP's signing capabilities. The PKP NFT will be self-owned, with access restricted to explicitly permitted entities.
        
        - If the minter's address is included in permittedAddresses or they have a permittedAuthMethod, they maintain control - not due to being the minter, but because they were explicitly granted permission.`,
};
