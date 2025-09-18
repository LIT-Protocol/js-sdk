// Suppress deprecation warning from WASM bindings
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('using deprecated parameters for `initSync()`')) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, args);
};
