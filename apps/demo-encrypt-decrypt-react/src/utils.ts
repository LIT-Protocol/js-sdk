export interface BenchmarkedResult<T> {
    duration: string;
    result: T;
}

export async function benchmark<T>(fn: () => Promise<T>): Promise<BenchmarkedResult<T>> {
    const t0 = performance.now();
    const result = await fn();
    const t1 = performance.now();

    return {
        duration: (t1 - t0) + " ms",
        result
    };
}