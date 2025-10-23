(() => {
  if (typeof globalThis.Buffer !== 'undefined') {
    return;
  }

  if (typeof Buffer !== 'undefined') {
    globalThis.Buffer = Buffer;
  }
})();

const denoFetch = (...args) => globalThis.fetch(...args);
export default denoFetch;
