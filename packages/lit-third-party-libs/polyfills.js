// This field will be automatically injected into the ./dist/packages/<package-name>/index.js file
// between the autogen:polyfills:start/end comments

try {

  // For some reason this breaks Next.js page.tsx, but works on all other pages
  if(!globalThis.__next_f){
    global.WebSocket = require('ws');
  }
} catch (e) {
  // swallow
}
