import pino from 'pino';
import type { Logger as PinoLogger, LoggerOptions } from 'pino';

const getLogLevel = (): string => {
  // Check for process.env.LOG_LEVEL in a Node.js-like environment
  if (
    typeof process !== 'undefined' &&
    process.env &&
    typeof process.env['LOG_LEVEL'] === 'string'
  ) {
    return process.env['LOG_LEVEL'];
  }
  // Default log level for browser or when LOG_LEVEL is not set
  return 'info';
};

// Initial logger setup - this variable will be exported
let logger: PinoLogger;

const isNodeEnvironment =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

if (isNodeEnvironment) {
  // Node.js initial setup (basic pino, will be attempted to be enhanced)
  logger = pino({ level: getLogLevel() });
} else {
  // Browser setup
  logger = pino({
    level: getLogLevel(),
    browser: {
      asObject: true, // Makes log objects easier to inspect in browser consoles
    },
  });
}

// Asynchronous function to attempt to enhance the logger with pino-caller in Node.js
async function tryEnhanceLoggerForNode() {
  // This check is technically redundant if this function is only called in Node context,
  // but it's a good safeguard.
  if (isNodeEnvironment) {
    try {
      // Dynamically import pino-caller. This prevents it from being in browser bundles.
      const pinoCallerModule = await import('pino-caller');
      // Handle potential differences in how CJS modules are exposed via dynamic import
      const pinoCallerWrapper = pinoCallerModule.default || pinoCallerModule;

      // Create a new pino instance specifically for pino-caller to wrap.
      // This ensures pino-caller operates on a logger with the correct Node.js settings.
      const nodeBaseLogger = pino({ level: getLogLevel() });
      logger = pinoCallerWrapper(nodeBaseLogger); // Reassign the exported logger
    } catch (e) {
      // If pino-caller fails to load, the basic pino logger for Node.js (already set) will be used.
      // You could add a log message here if desired, e.g., using console.error
      // console.error('pino-caller could not be loaded for Node.js. Falling back to basic pino logger.', e);
    }
  }
}

// In Node.js environments, attempt to enhance the logger.
// This is a "fire-and-forget" operation. The logger is usable synchronously
// from the start, and gets upgraded with caller info if pino-caller loads successfully.
if (isNodeEnvironment) {
  tryEnhanceLoggerForNode().catch((error) => {
    // The basic logger is already in place, so we just log the enhancement error.
    // console.error('Error during asynchronous logger enhancement for Node.js:', error);
  });
}

// Export the logger instance. It will be the basic one initially,
// and in Node.js, it's potentially replaced by the pino-caller-enhanced one
// after the asynchronous import and enhancement completes.
export { logger };
