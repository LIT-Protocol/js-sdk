import * as fs from 'fs';
import * as readline from 'readline';

interface LogEntry {
  timestamp: string;
  type: string;
  index: number;
  totalRuns: number;
  status: string;
  error?: string;
  fullError?: string;
}

async function extractFailedLogs(
  inputFile: string,
  outputFile: string
): Promise<void> {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const writeStream = fs.createWriteStream(outputFile);

  for await (const line of rl) {
    try {
      const logEntry: LogEntry = JSON.parse(line);
      if (logEntry.status === 'error') {
        writeStream.write(line + '\n');
      }
    } catch (error) {
      console.error('Error parsing line:', error);
    }
  }

  writeStream.end();
  console.log(`Failed logs have been extracted to ${outputFile}`);
}

// Usage
const inputFile = 'datil-pkp-sign-test-log-2024-08-15T09-17-51.874Z.log';
const outputFile = 'failed_logs.log';

extractFailedLogs(inputFile, outputFile)
  .then(() => console.log('Extraction complete'))
  .catch((error) => console.error('Error during extraction:', error));
