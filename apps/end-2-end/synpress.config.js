const path = require('path');
const packageJson = require('../../package.json');
const { defineConfig } = require('cypress');
// const setupNodeEvents = require(`${getSynpressPath()}/plugins/index`);
const fixturesFolder = `${getSynpressPath()}/fixtures`;
const supportFile = 'apps/e2e/tests/e2e/support.js';


module.exports = defineConfig({
  userAgent: 'synpress',
  retries: {
    runMode: process.env.CI ? 1 : 0,
    openMode: 0,
  },
  fixturesFolder,
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
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      require(`${getSynpressPath()}/plugins/index`)(on, config);
      // https://github.com/bahmutov/cypress-watch-and-reload
      require("cypress-watch-and-reload/plugins")(on, config);

      return config;
    },
    baseUrl: 'http://localhost:4200',
    specPattern: 'apps/e2e/tests/e2e/specs/**/*.{js,jsx,ts,tsx}',
    supportFile,
  },

});

function getSynpressPath() {
  if (process.env.SYNPRESS_LOCAL_TEST) {
    return '.';
  } else {
    return path.dirname(require.resolve(packageJson.name));
  }
}
