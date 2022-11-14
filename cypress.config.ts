import { defineConfig } from 'cypress';
// let savedData: any;
export default defineConfig({
  // retries: {
  //   runMode: process.env.CI ? 1 : 0,
  //   openMode: 0,
  // },
  // chromeWebSecurity: false,
  // viewportWidth: 1920,
  // viewportHeight: 1080,
  e2e: {
    // experimentalSessionAndOrigin: true,
    // testIsolation: 'off',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('cypress-metamask-v2/cypress/plugins')(on, config);
      require('cypress-watch-and-reload/plugins')(on, config);

      config.browsers = config.browsers.filter(
        (b) => b.family === 'chromium' && b.name !== 'electron'
      );

      return config;
    },
    baseUrl: 'http://localhost:' + (process.env.PORT ?? 3000),
  },
});
