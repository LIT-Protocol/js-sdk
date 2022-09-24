import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';
const path = require('path');
const packageJson = require('../../package.json');
// const { defineConfig } = require('cypress');
// import { getSynpressPath } from './helpers';

const { helpers } = require('./src/helpers');
const playwright = require('./src/commands/playwright');
const { metamask } = require('./src/commands/metamask');
const synthetix = require('./src/commands/synthetix');
const etherscan = require('./src/commands/etherscan');

// const supportFile = 'apps/example-nextjs-js-e2e/src/support/e2e.js';

import './src/support/commands';
// import { configure } from '@testing-library/cypress';

// const setupNodeEvents = require(`${getSynpressPath()}/plugins/index`);
// const fixturesFolder = `${getSynpressPath()}/fixtures`;
// const supportFile = 'apps/example-nextjs-js-e2e/src/support/e2e.ts';

// export default defineConfig({
//   e2e: nxE2EPreset(__dirname),
// });

export default defineConfig({
  userAgent: 'synpress',
  watchForFileChanges: true,
  retries: {
    runMode: process.env.CI ? 1 : 0,
    openMode: 0,
  },
  // fixturesFolder,
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
    ...nxE2EPreset(...__dirname),
    setupNodeEvents(on, config) {
    //   // e2e testing node events setup code
    //   // require('cypress-metamask-v2/cypress/plugins')(on)
      // require(`${getSynpressPath()}/plugins/index`)(on)

      on('before:browser:launch', async (browser = {}, arguments_) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          console.log('TRUE'); // required by cypress ¯\_(ツ)_/¯
          arguments_.args.push('--window-size=1920,1080');
          return arguments_;
        }
    
        if (browser.name === 'electron') {
          arguments_['width'] = 1920;
          arguments_['height'] = 1080;
          arguments_['resizable'] = false;
          return arguments_;
        }
    
        // metamask welcome screen blocks cypress from loading
        if (browser.name === 'chrome') {
          arguments_.args.push(
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          );
        }
        if (!process.env.SKIP_METAMASK_INSTALL) {
          // NOTE: extensions cannot be loaded in headless Chrome
          const metamaskPath = await helpers.prepareMetamask(
            process.env.METAMASK_VERSION || '9.7.1',
          );
          arguments_.extensions.push(metamaskPath);
        }
    
        return arguments_;
      });

      on('task', {
        error(message) {
          console.error('\u001B[31m', 'ERROR:', message, '\u001B[0m');
          return true;
        },
        warn(message) {
          console.warn('\u001B[33m', 'WARNING:', message, '\u001B[0m');
          return true;
        },
        // playwright commands
        initPlaywright: async () => {
          const connected = await playwright.init();
          return connected;
        },
        clearPlaywright: async () => {
          const cleared = await playwright.clear();
          return cleared;
        },
        assignWindows: async () => {
          const assigned = await playwright.assignWindows();
          return assigned;
        },
        clearWindows: async () => {
          const cleared = await playwright.clearWindows();
          return cleared;
        },
        assignActiveTabName: async tabName => {
          const assigned = await playwright.assignActiveTabName(tabName);
          return assigned;
        },
        isMetamaskWindowActive: async () => {
          const isMetamaskActive = await playwright.isMetamaskWindowActive();
          return isMetamaskActive;
        },
        isCypressWindowActive: async () => {
          const isCypressActive = await playwright.isCypressWindowActive();
          return isCypressActive;
        },
        switchToCypressWindow: async () => {
          const switched = await playwright.switchToCypressWindow();
          return switched;
        },
        switchToMetamaskWindow: async () => {
          const switched = await playwright.switchToMetamaskWindow();
          return switched;
        },
        switchToMetamaskNotification: async () => {
          const notificationPage = await playwright.switchToMetamaskNotification();
          return notificationPage;
        },
        unlockMetamask: async password => {
          const unlocked = await metamask.unlock(password);
          return unlocked;
        },
        importMetamaskAccount: async privateKey => {
          const imported = await metamask.importAccount(privateKey);
          return imported;
        },
        createMetamaskAccount: async accountName => {
          const created = await metamask.createAccount(accountName);
          return created;
        },
        switchMetamaskAccount: async accountNameOrAccountNumber => {
          const switched = await metamask.switchAccount(accountNameOrAccountNumber);
          return switched;
        },
        addMetamaskNetwork: async network => {
          const networkAdded = await metamask.addNetwork(network);
          return networkAdded;
        },
        changeMetamaskNetwork: async network => {
          if (process.env.NETWORK_NAME && !network) {
            network = process.env.NETWORK_NAME;
          } else if (!network) {
            network = 'kovan';
          }
          const networkChanged = await metamask.changeNetwork(network);
          return networkChanged;
        },
        activateCustomNonceInMetamask: async () => {
          const activated = await metamask.activateCustomNonce();
          return activated;
        },
        resetMetamaskAccount: async () => {
          const resetted = await metamask.resetAccount();
          return resetted;
        },
        disconnectMetamaskWalletFromDapp: async () => {
          const disconnected = await metamask.disconnectWalletFromDapp();
          return disconnected;
        },
        disconnectMetamaskWalletFromAllDapps: async () => {
          const disconnected = await metamask.disconnectWalletFromAllDapps();
          return disconnected;
        },
        confirmMetamaskSignatureRequest: async () => {
          const confirmed = await metamask.confirmSignatureRequest();
          return confirmed;
        },
        confirmMetamaskDataSignatureRequest: async () => {
          const confirmed = await metamask.confirmDataSignatureRequest();
          return confirmed;
        },
        rejectMetamaskSignatureRequest: async () => {
          const rejected = await metamask.rejectSignatureRequest();
          return rejected;
        },
        rejectMetamaskDataSignatureRequest: async () => {
          const rejected = await metamask.rejectDataSignatureRequest();
          return rejected;
        },
        confirmMetamaskEncryptionPublicKeyRequest: async () => {
          const confirmed = await metamask.confirmEncryptionPublicKeyRequest();
          return confirmed;
        },
        rejectMetamaskEncryptionPublicKeyRequest: async () => {
          const rejected = await metamask.rejectEncryptionPublicKeyRequest();
          return rejected;
        },
        confirmMetamaskDecryptionRequest: async () => {
          const confirmed = await metamask.confirmDecryptionRequest();
          return confirmed;
        },
        rejectMetamaskDecryptionRequest: async () => {
          const rejected = await metamask.rejectDecryptionRequest();
          return rejected;
        },
        confirmMetamaskPermissionToSpend: async () => {
          const confirmed = await metamask.confirmPermissionToSpend();
          return confirmed;
        },
        rejectMetamaskPermissionToSpend: async () => {
          const rejected = await metamask.rejectPermissionToSpend();
          return rejected;
        },
        acceptMetamaskAccess: async allAccounts => {
          const accepted = await metamask.acceptAccess(allAccounts);
          return accepted;
        },
        confirmMetamaskTransaction: async gasConfig => {
          const confirmed = await metamask.confirmTransaction(gasConfig);
          return confirmed;
        },
        rejectMetamaskTransaction: async () => {
          const rejected = await metamask.rejectTransaction();
          return rejected;
        },
        allowMetamaskToAddNetwork: async ({ waitForEvent }) => {
          const allowed = await metamask.allowToAddNetwork({ waitForEvent });
          return allowed;
        },
        rejectMetamaskToAddNetwork: async () => {
          const rejected = await metamask.rejectToAddNetwork();
          return rejected;
        },
        allowMetamaskToSwitchNetwork: async () => {
          const allowed = await metamask.allowToSwitchNetwork();
          return allowed;
        },
        rejectMetamaskToSwitchNetwork: async () => {
          const rejected = await metamask.rejectToSwitchNetwork();
          return rejected;
        },
        allowMetamaskToAddAndSwitchNetwork: async () => {
          const allowed = await metamask.allowToAddAndSwitchNetwork();
          return allowed;
        },
        getMetamaskWalletAddress: async () => {
          const walletAddress = await metamask.getWalletAddress();
          return walletAddress;
        },
        fetchMetamaskWalletAddress: async () => {
          return metamask.walletAddress();
        },
        setupMetamask: async ({
          secretWordsOrPrivateKey,
          network = 'kovan',
          password,
        }) => {
          if (process.env.NETWORK_NAME) {
            network = process.env.NETWORK_NAME;
          }
          if (process.env.PRIVATE_KEY) {
            secretWordsOrPrivateKey = process.env.PRIVATE_KEY;
          }
          if (process.env.SECRET_WORDS) {
            secretWordsOrPrivateKey = process.env.SECRET_WORDS;
          }
          await metamask.initialSetup({
            secretWordsOrPrivateKey,
            network,
            password,
          });
          return true;
        },
        snxExchangerSettle: async ({ asset, walletAddress, privateKey }) => {
          if (process.env.PRIVATE_KEY) {
            privateKey = process.env.PRIVATE_KEY;
          }
          const settled = await synthetix.settle({
            asset,
            walletAddress,
            privateKey,
          });
          // todo: wait for confirmation?
          return settled;
        },
        snxCheckWaitingPeriod: async ({ asset, walletAddress }) => {
          const waitingPeriod = await synthetix.checkWaitingPeriod({
            asset,
            walletAddress,
          });
          return waitingPeriod;
        },
        getNetwork: () => {
          const network = helpers.getNetwork();
          return network;
        },
        etherscanGetTransactionStatus: async ({ txid }) => {
          const txStatus = await etherscan.getTransactionStatus(txid);
          return txStatus;
        },
        etherscanWaitForTxSuccess: async ({ txid }) => {
          const txSuccess = await etherscan.waitForTxSuccess(txid);
          return txSuccess;
        },
      });

      
    },
    baseUrl: 'http://localhost:4200',
    specPattern: 'apps/example-nextjs-js-e2e/src/e2e/**/*.{js,jsx,ts,tsx}',
    // supportFile: 
  },
  // component: {
  //   setupNodeEvents,
  //   specPattern: './**/*spec.{js,jsx,ts,tsx}',
  //   // supportFile,
  // },
})