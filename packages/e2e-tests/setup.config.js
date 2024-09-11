const TestEnvironment = require('jest-environment-node').TestEnvironment;

class CustomEnvironment extends TestEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();
    require('dotenv').config();
    console.log('loaded configuration from .env', __dirname);
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;
