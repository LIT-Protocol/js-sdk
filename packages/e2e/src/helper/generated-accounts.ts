import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { privateKeyToAccount } from 'viem/accounts';

export type GeneratedAccountRecord = {
  runId: string;
  createdAt: string;
  network?: string;
  label: string;
  address: `0x${string}`;
  privateKey: `0x${string}`;
};

const DEFAULT_E2E_DIR = path.resolve(process.cwd(), '.e2e');
const DEFAULT_ACCOUNTS_FILE = path.join(
  DEFAULT_E2E_DIR,
  'generated-accounts.jsonl'
);

export const E2E_RUN_ID: string =
  process.env['E2E_RUN_ID'] ??
  `${Date.now()}-${process.pid}-${randomBytes(4).toString('hex')}`;

export function getGeneratedAccountsFilePath(): string {
  return process.env['E2E_GENERATED_ACCOUNTS_FILE'] ?? DEFAULT_ACCOUNTS_FILE;
}

export function persistGeneratedAccount(params: {
  label: string;
  privateKey: `0x${string}`;
  network?: string;
}): GeneratedAccountRecord {
  const filePath = getGeneratedAccountsFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const account = privateKeyToAccount(params.privateKey);
  const record: GeneratedAccountRecord = {
    runId: E2E_RUN_ID,
    createdAt: new Date().toISOString(),
    network: params.network,
    label: params.label,
    address: account.address,
    privateKey: params.privateKey,
  };

  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, {
    encoding: 'utf8',
  });

  // Best-effort: restrict permissions on *nix.
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // Ignore (e.g. Windows or filesystem constraints).
  }

  return record;
}

export function readGeneratedAccounts(params?: {
  filePath?: string;
  runId?: string;
}): GeneratedAccountRecord[] {
  const filePath = params?.filePath ?? getGeneratedAccountsFilePath();
  if (!fs.existsSync(filePath)) return [];

  const runId = params?.runId;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const records: GeneratedAccountRecord[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as GeneratedAccountRecord;
      if (runId && parsed.runId !== runId) continue;
      records.push(parsed);
    } catch {
      // Ignore malformed lines (best-effort persistence).
    }
  }

  return records;
}
