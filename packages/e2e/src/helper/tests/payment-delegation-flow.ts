import { init } from '../../init';

export const createPaymentDelegationFlowTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  _getAuthContext: () => any
) => {
  return async () => {
    // Get Payment Manager for Alice (the payer/delegator)
    const alicePaymentManager = await ctx.litClient.getPaymentManager({
      account: ctx.aliceViemAccount,
    });

    // Get Payment Manager for Bob (the user/delegatee)
    const bobPaymentManager = await ctx.litClient.getPaymentManager({
      account: ctx.bobViemAccount,
    });

    expect(alicePaymentManager).toBeDefined();
    expect(bobPaymentManager).toBeDefined();

    const aliceAddress = ctx.aliceViemAccount.address;
    const bobAddress = ctx.bobViemAccount.address;

    // Test 1: Get initial payers for Bob
    const initialPayers = await bobPaymentManager.getPayers({
      userAddress: bobAddress,
    });
    expect(Array.isArray(initialPayers)).toBe(true);
    const initialPayersCount = initialPayers.length;
    console.log('initialPayers', initialPayers);

    // Test 2: Get initial users for Alice
    const initialUsers = await alicePaymentManager.getUsers({
      payerAddress: aliceAddress,
    });
    expect(Array.isArray(initialUsers)).toBe(true);
    const initialUsersCount = initialUsers.length;
    console.log('initialUsers', initialUsers);

    // Test 3: Alice delegates payment to Bob
    const delegateTx = await alicePaymentManager.delegatePayments({
      userAddress: bobAddress,
    });
    expect(delegateTx.hash).toBeDefined();
    expect(delegateTx.receipt).toBeDefined();
    expect(delegateTx.receipt.status).toBe('success');

    // Test 4: Verify Bob now has Alice as a payer
    const payersAfterDelegate = await bobPaymentManager.getPayers({
      userAddress: bobAddress,
    });
    expect(payersAfterDelegate.length).toBe(initialPayersCount + 1);
    expect(payersAfterDelegate.includes(aliceAddress)).toBe(true);
    console.log('payersAfterDelegate', payersAfterDelegate);

    // Test 5: Verify Alice now has Bob as a user
    const usersAfterDelegate = await alicePaymentManager.getUsers({
      payerAddress: aliceAddress,
    });
    expect(usersAfterDelegate.length).toBe(initialUsersCount + 1);
    expect(usersAfterDelegate.includes(bobAddress)).toBe(true);
    console.log('usersAfterDelegate', usersAfterDelegate);

    // Test 6: Set a restriction for Alice
    const setRestrictionTx = await alicePaymentManager.setRestriction({
      totalMaxPrice: '1000000000000000000', // 1 ETH
      requestsPerPeriod: '100',
      periodSeconds: '3600', // 1 hour
    });
    expect(setRestrictionTx.hash).toBeDefined();
    expect(setRestrictionTx.receipt.status).toBe('success');
    console.log('setRestrictionTx', setRestrictionTx);

    // Test 7: Get and verify the restriction
    const restriction = await alicePaymentManager.getRestriction({
      payerAddress: aliceAddress,
    });
    expect(restriction).toBeDefined();
    expect(restriction.totalMaxPrice).toBe('1000000000000000000');
    expect(restriction.requestsPerPeriod).toBe('100');
    expect(restriction.periodSeconds).toBe('3600');
    console.log('restriction', restriction);
    // Test 8: Test batch operations - create test addresses
    const testAddresses = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
    ];

    // Delegate to multiple users
    const batchDelegateTx = await alicePaymentManager.delegatePaymentsBatch({
      userAddresses: testAddresses,
    });
    expect(batchDelegateTx.hash).toBeDefined();
    expect(batchDelegateTx.receipt.status).toBe('success');
    console.log('batchDelegateTx', batchDelegateTx);
    // Test 9: Verify batch delegation
    const usersAfterBatch = await alicePaymentManager.getUsers({
      payerAddress: aliceAddress,
    });
    expect(usersAfterBatch.includes(testAddresses[0])).toBe(true);
    expect(usersAfterBatch.includes(testAddresses[1])).toBe(true);
    console.log('usersAfterBatch', usersAfterBatch);
    // Test 10: Get payers and restrictions for multiple users
    const payersAndRestrictions =
      await alicePaymentManager.getPayersAndRestrictions({
        userAddresses: [bobAddress, testAddresses[0]],
      });
    expect(payersAndRestrictions).toBeDefined();
    expect(Array.isArray(payersAndRestrictions.payers)).toBe(true);
    expect(payersAndRestrictions.payers.length).toBe(2);
    expect(Array.isArray(payersAndRestrictions.restrictions)).toBe(true);
    expect(payersAndRestrictions.restrictions.length).toBe(2);
    console.log('payersAndRestrictions', payersAndRestrictions);
    // Test 11: Undelegate from batch users
    const batchUndelegateTx = await alicePaymentManager.undelegatePaymentsBatch(
      {
        userAddresses: testAddresses,
      }
    );
    expect(batchUndelegateTx.hash).toBeDefined();
    expect(batchUndelegateTx.receipt.status).toBe('success');
    console.log('batchUndelegateTx', batchUndelegateTx);
    // Test 12: Alice undelegates payment from Bob
    const undelegateTx = await alicePaymentManager.undelegatePayments({
      userAddress: bobAddress,
    });
    expect(undelegateTx.hash).toBeDefined();
    expect(undelegateTx.receipt.status).toBe('success');
    console.log('undelegateTx', undelegateTx);
    // Test 13: Verify Bob no longer has Alice as a payer
    const finalPayers = await bobPaymentManager.getPayers({
      userAddress: bobAddress,
    });
    expect(finalPayers.length).toBe(initialPayersCount);
    expect(finalPayers.includes(aliceAddress)).toBe(false);
    console.log('finalPayers', finalPayers);
    // Test 14: Verify Alice no longer has Bob as a user
    const finalUsers = await alicePaymentManager.getUsers({
      payerAddress: aliceAddress,
    });
    expect(finalUsers.includes(bobAddress)).toBe(false);
    console.log('finalUsers', finalUsers);
  };
};
