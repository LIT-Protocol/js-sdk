import { init } from '../../init';
import { assert } from '../assertions';

export const createPaymentManagerFlowTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    console.log('🏦 Testing Payment Manager flow');

    const authContext = getAuthContext();
    const paymentManager = await ctx.litClient.getPaymentManager({
      account: ctx.aliceViemAccount,
    });

    // Get the user's address from authContext (assuming it has a wallet or account)
    const userAddress =
      authContext.wallet?.account?.address ||
      authContext.account?.address ||
      ctx.aliceViemAccount.address;

    console.log('💰 Testing deposit functionality...');
    // Test deposit
    const depositAmount = '0.00001'; // Very small amount for testing (account only has 0.0001 ETH)
    const depositResult = await paymentManager.deposit({
      amountInEth: depositAmount,
    });

    assert.toBeDefined(
      depositResult.hash,
      'Deposit transaction hash should be defined'
    );
    assert.toBeDefined(
      depositResult.receipt,
      'Deposit transaction receipt should be defined'
    );
    console.log('✅ Deposit successful:', depositResult.hash);

    console.log('📊 Testing balance checking...');
    // Check balance after deposit
    const balanceInfo = await paymentManager.getBalance({ userAddress });

    assert.toBeDefined(
      balanceInfo.totalBalance,
      'Total balance should be defined'
    );
    assert.toBeDefined(
      balanceInfo.availableBalance,
      'Available balance should be defined'
    );
    assert.toBeGreaterThan(
      Number(balanceInfo.raw.totalBalance),
      0,
      'Balance should be greater than 0'
    );

    console.log('💰 Current balance:', balanceInfo.totalBalance, 'ETH');
    console.log('💳 Available balance:', balanceInfo.availableBalance, 'ETH');

    console.log('🔄 Testing withdrawal request...');
    // Test withdrawal request
    const withdrawAmount = '0.000005'; // Half of deposited amount
    const withdrawRequestResult = await paymentManager.requestWithdraw({
      amountInEth: withdrawAmount,
    });

    assert.toBeDefined(
      withdrawRequestResult.hash,
      'Withdrawal request transaction hash should be defined'
    );
    assert.toBeDefined(
      withdrawRequestResult.receipt,
      'Withdrawal request transaction receipt should be defined'
    );
    console.log(
      '✅ Withdrawal request successful:',
      withdrawRequestResult.hash
    );

    console.log('📋 Testing withdrawal request status...');
    // Check withdrawal request status
    const withdrawRequestInfo = await paymentManager.getWithdrawRequest({
      userAddress,
    });

    assert.toBe(
      withdrawRequestInfo.isPending,
      true,
      'Withdrawal request should be pending'
    );
    assert.toBe(
      withdrawRequestInfo.amount,
      withdrawAmount,
      'Withdrawal amount should match'
    );
    assert.toBeGreaterThan(
      Number(withdrawRequestInfo.timestamp),
      0,
      'Withdrawal timestamp should be greater than 0'
    );

    console.log(
      '⏰ Withdrawal request timestamp:',
      withdrawRequestInfo.timestamp
    );
    console.log(
      '💸 Withdrawal request amount:',
      withdrawRequestInfo.amount,
      'ETH'
    );

    console.log('⏱️ Testing withdrawal delay...');
    // Get withdrawal delay
    const delayInfo = await paymentManager.getWithdrawDelay();

    assert.toBeDefined(
      delayInfo.delaySeconds,
      'Delay seconds should be defined'
    );
    assert.toBeGreaterThan(
      Number(delayInfo.raw),
      0,
      'Delay should be greater than 0'
    );

    console.log('⏳ Withdrawal delay:', delayInfo.delaySeconds, 'seconds');

    console.log('🔍 Testing withdrawal execution check...');
    // Check if withdrawal can be executed
    const canExecuteInfo = await paymentManager.canExecuteWithdraw({
      userAddress,
    });

    assert.toBeDefined(
      canExecuteInfo.canExecute,
      'canExecute should be defined'
    );
    assert.toBe(
      canExecuteInfo.withdrawRequest.isPending,
      true,
      'Withdrawal request should be pending'
    );

    if (canExecuteInfo.canExecute) {
      console.log('✅ Withdrawal can be executed immediately');

      console.log('💸 Testing withdrawal execution...');
      // Execute withdrawal if possible
      const withdrawResult = await paymentManager.withdraw({
        amountInEth: withdrawAmount,
      });

      assert.toBeDefined(
        withdrawResult.hash,
        'Withdrawal execution transaction hash should be defined'
      );
      assert.toBeDefined(
        withdrawResult.receipt,
        'Withdrawal execution transaction receipt should be defined'
      );
      console.log('✅ Withdrawal executed successfully:', withdrawResult.hash);

      // Check balance after withdrawal
      const finalBalanceInfo = await paymentManager.getBalance({ userAddress });
      console.log('📊 Final balance:', finalBalanceInfo.totalBalance, 'ETH');
    } else {
      console.log(
        '⏱️ Withdrawal cannot be executed yet. Time remaining:',
        canExecuteInfo.timeRemaining,
        'seconds'
      );
    }

    console.log('🧪 Testing deposit for user functionality...');
    // Test deposit for another user (using alice's address as target)
    const targetUserAddress = ctx.aliceViemAccount.address;
    const depositForUserResult = await paymentManager.depositForUser({
      userAddress: targetUserAddress,
      amountInEth: '0.00001',
    });

    assert.toBeDefined(
      depositForUserResult.hash,
      'Deposit for user transaction hash should be defined'
    );
    assert.toBeDefined(
      depositForUserResult.receipt,
      'Deposit for user transaction receipt should be defined'
    );
    console.log('✅ Deposit for user successful:', depositForUserResult.hash);

    // Check target user's balance
    const targetUserBalance = await paymentManager.getBalance({
      userAddress: targetUserAddress,
    });
    assert.toBeGreaterThan(
      Number(targetUserBalance.raw.totalBalance),
      0,
      'Target user balance should be greater than 0'
    );
    console.log(
      '💰 Target user balance:',
      targetUserBalance.totalBalance,
      'ETH'
    );

    console.log('✅ Payment Manager flow test completed successfully!');
  };
};
