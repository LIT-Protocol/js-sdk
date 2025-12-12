# @lit-protocol/logger

Centralized logging for the Lit Protocol SDK. The default backend is structured `pino` logging, but you can attach custom transports (DataDog, Sentry, your own system) and it works in both Node.js and browsers.

## Basic usage

```ts
import { logger, getChildLogger } from '@lit-protocol/logger';

logger.info('SDK started');

const log = getChildLogger({ module: 'my-feature' });
log.debug({ foo: 'bar' }, 'doing work');
```

## Log levels

Logging verbosity is controlled by:
- Node.js: `process.env.LOG_LEVEL`
- Browser: `globalThis.LOG_LEVEL`

Supported levels: `silent`, `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `debug2`.

`debug2` is treated like `debug` but uses raw console output for maximum verbosity.

## Configuration

Use `setLoggerOptions` at app startup to change level/name or add metadata:

```ts
import { setLoggerOptions } from '@lit-protocol/logger';

setLoggerOptions({
  level: 'info',
  name: 'MyApp',
  bindings: { app: 'my-app' },
});
```

### Custom transports

To forward logs to any system, provide `transports`. Each transport receives a normalized `LogEntry`:

```ts
type LogEntry = {
  level: LogLevel;
  time: number;
  msg?: string;
  data?: unknown;
  bindings: Record<string, unknown>;
  args: unknown[];
};
```

Example:

```ts
import { setLoggerOptions } from '@lit-protocol/logger';

setLoggerOptions({
  level: 'info',
  transports: [
    (entry) => {
      mySink.send(entry);
    },
  ],
  useDefaultTransports: true, // keep default pino/console output
});
```

To *replace* the default backend entirely, set `useDefaultTransports: false`.

### DataDog examples

**Node.js:** DataDog agents can ingest JSON logs from stdout. The default pino output is compatible; just set `LOG_LEVEL` and run your app.

**Browser:** using `@datadog/browser-logs`:

```ts
import { datadogLogs } from '@datadog/browser-logs';
import { setLoggerOptions } from '@lit-protocol/logger';

setLoggerOptions({
  level: 'info',
  useDefaultTransports: false,
  transports: [
    ({ level, msg, bindings, data }) => {
      if (level === 'silent') return;

      const status =
        level === 'fatal'
          ? 'error'
          : level === 'trace' || level === 'debug2'
            ? 'debug'
            : level;

      const context = { ...bindings, ...(data as any) };

      if (status === 'error' && (context as any).err instanceof Error) {
        datadogLogs.logger.error(msg || 'error', context, (context as any).err);
        return;
      }

      (datadogLogs.logger as any)[status](msg || 'log', context);
    },
  ],
});
```

## Building

Run `nx build logger` to build the library.

## Running unit tests

Run `nx test logger` to execute unit tests via Jest.
