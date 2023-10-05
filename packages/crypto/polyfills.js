// This field will be automatically injected into the ./dist/packages/<package-name>/index.js file
// between the autogen:polyfills:start/end comments

try {
  if (isNode()) {
    try {
      //@ts-ignore
      let { Blob } = import('node:buffer').then((module) => {
        globalThis.Blob = module.Blob;
      });
    } catch (e) {
      console.log(
        'Warn: could not resolve Blob from node api set, perhaps polyfil a Blob implementation of your choice'
      );
    }
  }
} catch (e) {
  // swallow
}
