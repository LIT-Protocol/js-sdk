import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';

// export default defineConfig({
//   e2e: nxE2EPreset(__dirname),
// });

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname),
    setupNodeEvents(on, config) {
      // e2e testing node events setup code
      require('cypress-metamask-v2/cypress/plugins')(on)
    },
  }
})