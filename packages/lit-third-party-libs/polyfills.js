// This field will be automatically injected into the ./dist/packages/<package-name>/index.js file
// between the autogen:polyfills:start/end comments

try {
  global.WebSocket = require('ws');
} catch (e) {
  // swallow
}
