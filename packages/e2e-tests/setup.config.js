/**
 * Global setup file for jest e2e tests
 * Loads all global context and provides to each test runner as needed
 * env loading has been moved into 
 */


const NodeEnvironment = require('jest-environment-node');
const TinnyEnvironment = require('@lit-protocol/tinny').TinnyEnvironment;

require('dotenv').config();
console.log('loaded configuration from .env', __dirname);


class CustomEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();
    this.global.devEnv = new TinnyEnvironment();
    await this.global.devEnv.init();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;