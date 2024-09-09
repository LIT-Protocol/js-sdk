module.exports = async function (globalConfig, projectConfig) {
  console.log('test global setup fires once');
  console.log(globalConfig.testPathPattern);
  console.log(projectConfig.cache);
};
