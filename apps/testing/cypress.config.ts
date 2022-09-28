import { defineConfig } from 'cypress';
// import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';
import { metamaskPlugin } from './src/e2e/plugins';

export default defineConfig({
  userAgent: 'synpress',
  watchForFileChanges: true,
  retries: {
    runMode: process.env.CI ? 1 : 0,
    openMode: 0,
  },
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  chromeWebSecurity: true,
  viewportWidth: 1920,
  viewportHeight: 1080, 
  env: {
    coverage: false,
  },
  defaultCommandTimeout: process.env.SYNDEBUG ? 9999999 : 30000,
  pageLoadTimeout: process.env.SYNDEBUG ? 0 : 9999999,
  requestTimeout: process.env.SYNDEBUG ? 0 : 9999999,
  e2e: {
    supportFile: 'src/support/e2e.ts',
    specPattern: 'src/e2e/*.{js,jsx,ts,tsx}',
    // ...nxE2EPreset(__dirname),
    setupNodeEvents(on, config){
      metamaskPlugin(on, config);
    },
    baseUrl: 'http://localhost:4200'
  },
});
