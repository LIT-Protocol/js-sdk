# BLS-SDK

Read more about it here

https://github.com/LIT-Protocol/sev-snp-utils-wasm

# Installation

```
yarn add @lit-protocol/sev-snp-utils-sdk
```

# Usage

```js
import { initSevSnpUtilsSdk } from '@lit-protocol/sev-snp-utils-sdk';

initSevSnpUtilsSdk().then((exports) => {
  globalThis.wasmExports = exports;
  log(
    `✅ [SEV SNP Utils SDK] wasmExports loaded. ${
      Object.keys(exports).length
    } functions available. Run 'wasmExports' in the console to see them.`
  );
});
```

# Then

```js
// Check an attestation report
let attestationReport = 'someAttestationReportObtainedFromSomewhere';
try {
  await wasmExports.verify_attestation_report(report);
} catch (e) {
  console.error(e);
}
```

The verify_attestation_report() function will throw an error if the attestation report is invalid. Otherwise, it will return undefined.
