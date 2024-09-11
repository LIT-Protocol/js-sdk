module.exports = async function (globalConfig, projectConfig) {
  console.log('starting global teardown, stopping testnet');
  console.log(globalConfig);
  console.log(projectConfig);
  if (process.env['USE_SHIVA'] === true) {
    const stopResp = await global.__TESTNET__.getTestnetConfig();

    console.log('test suite cleanup last testnet config', stopResp);
  } else {
    console.log('Skipping network teardown, using live network');
  }
};
