import { init } from '../../init';

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
      amountInLitkey: depositAmount,
    });

    expect(depositResult.hash).toBeDefined();
    expect(depositResult.receipt).toBeDefined();
    console.log('✅ Deposit successful:', depositResult.hash);

    console.log('📊 Testing balance checking...');
    // Check balance after deposit
    const balanceInfo = await paymentManager.getBalance({ userAddress });

    expect(balanceInfo.totalBalance).toBeDefined();
    expect(balanceInfo.availableBalance).toBeDefined();
    expect(Number(balanceInfo.raw.totalBalance)).toBeGreaterThan(0);

    console.log('💰 Current balance:', balanceInfo.totalBalance, 'ETH');
    console.log('💳 Available balance:', balanceInfo.availableBalance, 'ETH');

    console.log('🔄 Testing withdrawal request...');
    // Test withdrawal request
    const withdrawAmount = '0.000005'; // Half of deposited amount
    const withdrawRequestResult = await paymentManager.requestWithdraw({
      amountInLitkey: withdrawAmount,
    });

    expect(withdrawRequestResult.hash).toBeDefined();
    expect(withdrawRequestResult.receipt).toBeDefined();
    console.log(
      '✅ Withdrawal request successful:',
      withdrawRequestResult.hash
    );

    console.log('📋 Testing withdrawal request status...');
    // Check withdrawal request status
    const withdrawRequestInfo = await paymentManager.getWithdrawRequest({
      userAddress,
    });

    expect(withdrawRequestInfo.isPending).toBe(true);
    expect(withdrawRequestInfo.amount).toBe(withdrawAmount);
    expect(Number(withdrawRequestInfo.timestamp)).toBeGreaterThan(0);

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

    expect(delayInfo.delaySeconds).toBeDefined();
    expect(Number(delayInfo.raw)).toBeGreaterThan(0);

    console.log('⏳ Withdrawal delay:', delayInfo.delaySeconds, 'seconds');

    console.log('🔍 Testing withdrawal execution check...');
    // Check if withdrawal can be executed
    const canExecuteInfo = await paymentManager.canExecuteWithdraw({
      userAddress,
    });

    expect(canExecuteInfo.canExecute).toBeDefined();
    expect(canExecuteInfo.withdrawRequest.isPending).toBe(true);

    if (canExecuteInfo.canExecute) {
      console.log('✅ Withdrawal can be executed immediately');

      console.log('💸 Testing withdrawal execution...');
      // Execute withdrawal if possible
      const withdrawResult = await paymentManager.withdraw({
        amountInLitkey: withdrawAmount,
      });

      expect(withdrawResult.hash).toBeDefined();
      expect(withdrawResult.receipt).toBeDefined();
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
      amountInLitkey: '0.00001',
    });

    expect(depositForUserResult.hash).toBeDefined();
    expect(depositForUserResult.receipt).toBeDefined();
    console.log('✅ Deposit for user successful:', depositForUserResult.hash);

    // Check target user's balance
    const targetUserBalance = await paymentManager.getBalance({
      userAddress: targetUserAddress,
    });
    expect(Number(targetUserBalance.raw.totalBalance)).toBeGreaterThan(0);
    console.log(
      '💰 Target user balance:',
      targetUserBalance.totalBalance,
      'ETH'
    );

    console.log('✅ Payment Manager flow test completed successfully!');
  };
};
