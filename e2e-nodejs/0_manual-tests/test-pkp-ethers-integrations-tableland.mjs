/**
 * ========== !!! NOTE !!! ==========
 * Make sure you have topped up your account with ETH. In this case, we are using
 * the Polygon Mumbai testnet. You can get some testnet ETH here:
 * https://mumbaifaucet.com/
 * https://faucet.quicknode.com/polygon/mumbai
 */
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';

// -- Integration
import { Database } from '@tableland/sdk';

export async function main() {
  // ==================== Setup ====================
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpc: LITCONFIG.CHRONICLE_RPC,
  });

  // ==================== Test Logic ====================

  // -- 1. set wallet rpc
  pkpEthersWallet.setRpc('https://polygon-mumbai-bor.publicnode.com');
  await pkpEthersWallet.init();

  // -- 2. init db
  const db = new Database({ signer: pkpEthersWallet });

  // -- 3. create a table
  let tableName = '';
  let tbReceipt = null;
  try {
    const prefix = 'my_table';
    const { meta: create } = await db
      .prepare(`CREATE TABLE ${prefix} (id integer primary key, val text);`)
      .run();

    tableName = create.txn?.name ?? ''; // e.g., my_table_80001_8085

    tbReceipt = await create.txn?.wait();
  } catch (e) {
    return fail(`Failed to create table: ${e}`);
  }

  if (!tbReceipt) {
    return fail('should create a tableland database & table');
  }

  // -- 4 - set gas price & limit
  // This should fix "replacement fee too low"
  // If a current transaction exists with the same nonce, increment the gas price
  pkpEthersWallet.setGasPrice(
    (await pkpEthersWallet.getGasPrice()).mul(900).div(100)
  );
  pkpEthersWallet.setGasLimit(ethers.utils.hexlify(600000));

  // -- 5. write to table
  let writeReceipt = null;
  try {
    const { meta: insert } = await db
      .prepare(`INSERT INTO ${tableName} (id, val) VALUES (?, ?);`)
      .bind(0, 'Lit-Tableland')
      .run();

    writeReceipt = await insert.txn?.wait();
  } catch (e) {
    return fail(`Failed to write to table: ${e}`);
  }

  if (!writeReceipt) {
    return fail('should write to table');
  }

  // -- 5. read from table
  let readResult;
  try {
    const { results } = await db.prepare(`SELECT * FROM ${tableName};`).run();
    readResult = results;
  } catch (e) {
    return fail(`Failed to read from table: ${e}`);
  }

  // ==================== Post-Validation ====================

  // if (!res.logs.includes('hello world')) {
  //   return fail('lit action client should be ready');
  // }
  // if (!res.success) {
  //   return fail('response should be success');
  // }
  // ==================== Success ====================
  return success(`should create a tableland database, write & read the table
table name: ${tableName}
table hash: ${tbReceipt?.transactionHash}
write hash: ${writeReceipt?.transactionHash}
read value: ${readResult[0].val}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
