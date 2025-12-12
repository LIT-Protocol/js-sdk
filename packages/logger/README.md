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

Supported levels: `silent`, `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `debug_text`.

`debug_text` switches the default output to console-style text (not JSON). `debug2` is a deprecated alias for `debug_text`.

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
          : level === 'trace' || level === 'debug_text' || level === 'debug2'
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

### OpenTelemetry example (Node.js)

You can forward logs via `transports` to the OpenTelemetry Logs API:

```ts
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { setLoggerOptions } from '@lit-protocol/logger';

const provider = new LoggerProvider();
provider.addLogRecordProcessor(
  new BatchLogRecordProcessor(
    new OTLPLogExporter({ url: 'http://localhost:4318/v1/logs' })
  )
);
logs.setGlobalLoggerProvider(provider);

const otelLogger = logs.getLogger('lit-sdk');

const levelToSeverity: Record<string, SeverityNumber> = {
  fatal: SeverityNumber.FATAL,
  error: SeverityNumber.ERROR,
  warn: SeverityNumber.WARN,
  info: SeverityNumber.INFO,
  debug: SeverityNumber.DEBUG,
  debug_text: SeverityNumber.DEBUG,
  trace: SeverityNumber.TRACE,
};

setLoggerOptions({
  level: 'info',
  useDefaultTransports: false,
  transports: [
    ({ level, msg, bindings, data, time }) => {
      if (level === 'silent') return;
      otelLogger.emit({
        body: msg ?? 'log',
        severityNumber: levelToSeverity[level] ?? SeverityNumber.UNSPECIFIED,
        severityText: level,
        attributes: { ...bindings, ...(data as any) },
        timestamp: time,
      });
    },
  ],
});
```

## Building

Run `nx build logger` to build the library.

## Running unit tests

Run `nx test logger` to execute unit tests via Jest.
