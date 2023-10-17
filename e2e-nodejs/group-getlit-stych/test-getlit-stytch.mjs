import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { loadLit } from '../../packages/getlit-sdk/dist/src/index.js';

export async function main() {
  // ==================== Setup ====================

  // -- Stytch OTP Config
  (await loadLit()).withOTPProvider({
    provider: 'stytch',
    options: {
      projectId: process.env.STYTCH_PROJECT_ID,
      secret: process.env.STYTCH_SECRET,
    },
  });

  // ==================== Test Logic ====================
  if (process.argv.slice(2).find((arg) => arg.startsWith('--send'))) {
    const { methodId } = await Lit.auth.otp?.sendOTP({
      method: 'email',
      userId: 'xx@yy.com',
    });
    console.log('methodId:', methodId);
  }

  if (process.argv.slice(2).find((arg) => arg.startsWith('--verify'))) {
    const res = await Lit.auth.otp?.authenticate({
      methodId: 'XX',
      code: "041527",
    });

    console.log('res:', res);
  }

  // ==================== Post-Validation ====================
  // if (!res.logs.includes('hello world')) {
  //   return fail('lit action client should be ready');
  // }
  // if (!res.success) {
  //   return fail('response should be success');
  // }
  // ==================== Success ====================
  return success('Getlit to stytch');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
