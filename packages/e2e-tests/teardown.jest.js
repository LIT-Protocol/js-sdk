module.exports = async function (globalConfig, projectConfig) {
  console.log('starting global teardown, stopping testnet');
  console.log(globalConfig.testPathPattern);
  console.log(projectConfig.cache);

  const stopResp = await global.__TESTNET__.getTestnetConfig();

  console.log('test suite cleanup last testnet config', stopResp);
};
