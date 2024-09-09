module.exports = async function (globalConfig, projectConfig) {
    console.log('test global teardown fires once')
    console.log(globalConfig.testPathPattern);
    console.log(projectConfig.cache);  
};