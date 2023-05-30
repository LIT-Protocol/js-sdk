export const benchmark = async (func, callback) => {
    const t0 = performance.now();
    const res = await func();
    const t1 = performance.now();

    await callback((t1 - t0) + " ms", res);
}