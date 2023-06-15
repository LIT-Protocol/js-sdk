export async function benchmark<T>(func: () => Promise<T>, callback: (ms: string, res: T) => void) {
    const t0 = performance.now();
    const res = await func();
    const t1 = performance.now();

    callback((t1 - t0) + " ms", res);
}