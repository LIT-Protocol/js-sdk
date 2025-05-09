# Conceptual Example

Here's an conceptual example of using the wagmi config on the client side:

```tsx
<WagmiProvider config={config}>
  <ExampleComponent />
</WagmiProvider>;

import React, { useEffect } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { createLitContracts } from '../createLitContracts';

export function ExampleComponent() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (publicClient && walletClient) {
      // Pass wagmi's clients into your Lit function
      const { pkpNftContract, pkpHelperContract } = createLitContracts(
        'datil-dev',
        {
          publicClient,
          walletClient,
        }
      );

      // Now you can do contract reads/writes with the user's wallet
      (async () => {
        const cost = await pkpNftContract.read.mintCost();
        console.log('mintCost =', cost);
      })();
    }
  }, [publicClient, walletClient]);

  return <div>My wagmi + Lit example</div>;
}
```
