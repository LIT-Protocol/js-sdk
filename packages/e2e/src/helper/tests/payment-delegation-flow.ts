import { init } from '../../init';
import { assert } from '../assertions';

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

    assert.toBeDefined(alicePaymentManager);
    assert.toBeDefined(bobPaymentManager);

    const aliceAddress = ctx.aliceViemAccount.address;
    const bobAddress = ctx.bobViemAccount.address;

    // Test 1: Get initial payers for Bob
    const initialPayers = await bobPaymentManager.getPayers({
      userAddress: bobAddress,
    });
    assert.toBe(Array.isArray(initialPayers), true);
    const initialPayersCount = initialPayers.length;
    console.log('initialPayers', initialPayers);

    // Test 2: Get initial users for Alice
    const initialUsers = await alicePaymentManager.getUsers({
      payerAddress: aliceAddress,
    });
    assert.toBe(Array.isArray(initialUsers), true);
    const initialUsersCount = initialUsers.length;
    console.log('initialUsers', initialUsers);

    // Test 3: Alice delegates payment to Bob
    const delegateTx = await alicePaymentManager.delegatePayments({
      userAddress: bobAddress,
    });
    assert.toBeDefined(delegateTx.hash);
    assert.toBeDefined(delegateTx.receipt);
    assert.toBe(delegateTx.receipt.status, 'success');

    // Test 4: Verify Bob now has Alice as a payer
    const payersAfterDelegate = await bobPaymentManager.getPayers({
      userAddress: bobAddress,
    });
    assert.toBe(payersAfterDelegate.length, initialPayersCount + 1);
    assert.toBe(payersAfterDelegate.includes(aliceAddress), true);
    console.log('payersAfterDelegate', payersAfterDelegate);

    // Test 5: Verify Alice now has Bob as a user
    const usersAfterDelegate = await alicePaymentManager.getUsers({
      payerAddress: aliceAddress,
    });
    assert.toBe(usersAfterDelegate.length, initialUsersCount + 1);
    assert.toBe(usersAfterDelegate.includes(bobAddress), true);
    console.log('usersAfterDelegate', usersAfterDelegate);

    // Test 6: Set a restriction for Alice
    const setRestrictionTx = await alicePaymentManager.setRestriction({
      totalMaxPrice: '1000000000000000000', // 1 ETH
      requestsPerPeriod: '100',
      periodSeconds: '3600', // 1 hour
    });
    assert.toBeDefined(setRestrictionTx.hash);
    assert.toBe(setRestrictionTx.receipt.status, 'success');
    console.log('setRestrictionTx', setRestrictionTx);

    // Test 7: Get and verify the restriction
    const restriction = await alicePaymentManager.getRestriction({
      payerAddress: aliceAddress,
    });
    assert.toBeDefined(restriction);
    assert.toBe(restriction.totalMaxPrice, '1000000000000000000');
    assert.toBe(restriction.requestsPerPeriod, '100');
    assert.toBe(restriction.periodSeconds, '3600');
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
    assert.toBeDefined(batchDelegateTx.hash);
    assert.toBe(batchDelegateTx.receipt.status, 'success');
    console.log('batchDelegateTx', batchDelegateTx);
    // Test 9: Verify batch delegation
    const usersAfterBatch = await alicePaymentManager.getUsers({
      payerAddress: aliceAddress,
    });
    assert.toBe(usersAfterBatch.includes(testAddresses[0]), true);
    assert.toBe(usersAfterBatch.includes(testAddresses[1]), true);
    console.log('usersAfterBatch', usersAfterBatch);
    // Test 10: Get payers and restrictions for multiple users
    const payersAndRestrictions =
      await alicePaymentManager.getPayersAndRestrictions({
        userAddresses: [bobAddress, testAddresses[0]],
      });
    assert.toBeDefined(payersAndRestrictions);
    assert.toBe(Array.isArray(payersAndRestrictions.payers), true);
    assert.toBe(payersAndRestrictions.payers.length, 2);
    assert.toBe(Array.isArray(payersAndRestrictions.restrictions), true);
    assert.toBe(payersAndRestrictions.restrictions.length, 2);
    console.log('payersAndRestrictions', payersAndRestrictions);
    // Test 11: Undelegate from batch users
    const batchUndelegateTx = await alicePaymentManager.undelegatePaymentsBatch(
      {
        userAddresses: testAddresses,
      }
    );
    assert.toBeDefined(batchUndelegateTx.hash);
    assert.toBe(batchUndelegateTx.receipt.status, 'success');
    console.log('batchUndelegateTx', batchUndelegateTx);
    // Test 12: Alice undelegates payment from Bob
    const undelegateTx = await alicePaymentManager.undelegatePayments({
      userAddress: bobAddress,
    });
    assert.toBeDefined(undelegateTx.hash);
    assert.toBe(undelegateTx.receipt.status, 'success');
    console.log('undelegateTx', undelegateTx);
    // Test 13: Verify Bob no longer has Alice as a payer
    const finalPayers = await bobPaymentManager.getPayers({
      userAddress: bobAddress,
    });
    assert.toBe(finalPayers.length, initialPayersCount);
    assert.toBe(finalPayers.includes(aliceAddress), false);
    console.log('finalPayers', finalPayers);
    // Test 14: Verify Alice no longer has Bob as a user
    const finalUsers = await alicePaymentManager.getUsers({
      payerAddress: aliceAddress,
    });
    assert.toBe(finalUsers.includes(bobAddress), false);
    console.log('finalUsers', finalUsers);
  };
};
