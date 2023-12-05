# End to End NodeJS testing

End to end testing environment for different operations on the Lit Network
- Message singing
- Transaction signing
- Session signature generation / signing
- Lit Action api testing
- LitContracts testing
- Concurrency operation tests
   - 1 signature tests
   - multi signature tests


## Usage
To run all tests in all groups you can use the command
`yarn test:e2e:node`

Each test suite is contained in a single folder which is called a `group` groups can be filtered by the `filter` flag

`yarn test:e2e:node --group=lit-actions`
In the above example, only tests in the `group-lit-actions` will run as group flags omit the `group` prefix

`yarn test:e2e:node --group=lit-actions --filter=1-sig`
In the above example, we only run the `lit-actions` test group with a filter on the `test-lit-action-1-sig` which is reduced to `1-sig` from the `group` flag

## environment Configuration
```
NETWORK = cayenne | internalDev #Configures the network context for the test run
DEBUG = true | false # Turns on or off logging
CHECK_SEV = true | false # Configures checking of sev snp attestation reports
MINT_NEW = true | false # Enables provisioning of new keys for the test run
```
