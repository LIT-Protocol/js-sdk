type FsPromisesLike = {
  mkdir: (path: string, options: { recursive: boolean }) => Promise<unknown>;
  writeFile: (
    path: string,
    data: string,
    options: { encoding: 'utf8' }
  ) => Promise<unknown>;
};

type PathLike = {
  dirname: (path: string) => string;
  isAbsolute: (path: string) => boolean;
  join: (...paths: string[]) => string;
};

function getEnvVar(key: string): string | undefined {
  try {
    if (typeof process === 'undefined' || typeof process.env !== 'object') {
      return undefined;
    }
    const value = process.env[key];
    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
}

function isNodeJsRuntime(): boolean {
  try {
    return (
      typeof process !== 'undefined' &&
      typeof process.versions === 'object' &&
      !!process.versions?.node
    );
  } catch {
    return false;
  }
}

function isWriteCurlDebugEnabled(): boolean {
  const envValue = getEnvVar('LIT_DEBUG_CURL');
  return envValue === 'true' || envValue === '1';
}

function sanitizeRequestIdForFilename(requestId: string): string | null {
  const trimmed = requestId.trim();
  if (trimmed.length === 0) return null;

  const sanitized = trimmed.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (sanitized === '.' || sanitized === '..') return null;

  return sanitized;
}

function getNodeRequire(): ((specifier: string) => any) | undefined {
  try {
    // eslint-disable-next-line no-eval
    const req = eval('require') as unknown;
    return typeof req === 'function' ? (req as any) : undefined;
  } catch {
    return undefined;
  }
}

export function generateCurlCommand(url: string, init: RequestInit): string {
  const method = init.method ?? 'GET';

  const headerEntries: Array<[string, string]> = [];
  if (Array.isArray(init.headers)) {
    for (const entry of init.headers) {
      if (!Array.isArray(entry) || entry.length !== 2) continue;
      headerEntries.push([String(entry[0]), String(entry[1])]);
    }
  } else if (
    init.headers &&
    typeof (init.headers as Headers).forEach === 'function'
  ) {
    (init.headers as Headers).forEach((value, key) => {
      headerEntries.push([key, value]);
    });
  } else if (init.headers && typeof init.headers === 'object') {
    for (const [key, value] of Object.entries(
      init.headers as Record<string, unknown>
    )) {
      headerEntries.push([key, String(value)]);
    }
  }

  const headers = headerEntries
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ');

  const body = typeof init.body === 'string' ? `--data '${init.body}'` : '';

  return `curl -X ${method} ${headers} ${body} "${url}"`.trim();
}

export async function writeCurlCommandDebugFile(params: {
  requestId: string;
  curlCommand: string;
  idHeaderName?: string;
}): Promise<void> {
  if (!isNodeJsRuntime() || !isWriteCurlDebugEnabled()) {
    return;
  }

  try {
    const safeRequestId = sanitizeRequestIdForFilename(params.requestId);
    if (!safeRequestId) {
      return;
    }

    const requireFn = getNodeRequire();
    if (!requireFn) {
      return;
    }

    const fsModule = requireFn('node:fs/promises');
    const pathModule = requireFn('node:path');

    const fs: FsPromisesLike = fsModule?.default ?? fsModule;
    const path: PathLike = pathModule?.default ?? pathModule;

    const debugDirEnv = getEnvVar('LIT_DEBUG_CURL_DIR');
    const debugDir =
      typeof debugDirEnv === 'string' && debugDirEnv.trim().length > 0
        ? debugDirEnv.trim()
        : 'debug';

    const dirPath = path.isAbsolute(debugDir)
      ? debugDir
      : path.join(process.cwd(), debugDir);

    const filePath = path.join(dirPath, safeRequestId);
    const idHeaderName = params.idHeaderName ?? 'request-id';

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(
      filePath,
      `# ${idHeaderName}: ${params.requestId}\n${params.curlCommand}\n`,
      {
        encoding: 'utf8',
      }
    );
  } catch {
    // Best-effort debug helper; ignore filesystem errors.
  }
}

