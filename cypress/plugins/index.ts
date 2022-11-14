module.exports = (on, config) => {
  require('cypress-metamask-v2/cypress/plugins')(on);
  return config;
};
