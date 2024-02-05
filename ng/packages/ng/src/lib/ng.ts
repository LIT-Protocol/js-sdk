import init, { greet } from '@lit-protocol/wasm/wasm';

export async function ng(): Promise<string> {
  await init(require('@lit-protocol/wasm/wasm_bg.wasm')); // eslint-disable-line @typescript-eslint/no-var-requires
  return greet();
}
