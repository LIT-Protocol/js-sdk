/**
 * Test flow demonstrating how to get PKPs by authentication data with storage providers
 * This example shows:
 * 1. Creating an EOA authentication method
 * 2. Minting a PKP with that auth method
 * 3. Finding PKPs associated with the auth data (with pagination and granular caching)
 *
 * Run with: bun run examples/src/get-pkps-flow.ts
 */

// Import storage plugins from the auth package
import { storagePlugins } from '@lit-protocol/auth';
const { localStorage, localStorageNode } = storagePlugins;

export const getPKPsFlow = async () => {
  const { init } = await import('./init');
  const { myAccount, litClient } = await init();

  const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
  const authData = await ViemAccountAuthenticator.authenticate(myAccount);

  const startTime1 = Date.now();
  const noStorageResult = await litClient.viewPKPsByAuthData({
    authData: {
      authMethodType: authData.authMethodType,
      authMethodId: authData.authMethodId,
    },
    pagination: {
      limit: 10,
      offset: 0,
    },
  });

  const duration1 = Date.now() - startTime1;
  console.log(`⏱️  First call completed in ${duration1}ms`);
  console.log(`📊 Found ${noStorageResult.pagination.total} total PKPs`);
  console.log('noStorageResult:', noStorageResult);

  const startTime2 = Date.now();
  const withStorageResult = await litClient.viewPKPsByAuthData({
    authData: {
      authMethodType: authData.authMethodType,
      authMethodId: authData.authMethodId,
    },
    pagination: {
      limit: 10,
      offset: 0,
    },
    storageProvider: localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: 'pkp-tokens',
    }),
  });
  console.log('withStorageResult:', withStorageResult);

  const duration2 = Date.now() - startTime2;
  console.log(`⏱️  Second call completed in ${duration2}ms`);
  console.log(`📊 Found ${withStorageResult.pagination.total} total PKPs`);

  process.exit();

  console.log(
    '🚀 Starting Get PKPs by Auth Data Flow with Storage Providers...'
  );

  try {
    // Step 1: Initialize the setup
    const { init } = await import('./init');
    const { myAccount, litClient } = await init();

    console.log('✅ LitClient initialized');
    console.log('📍 Account address:', myAccount.address);

    // Step 2: Create EOA authentication data
    const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
    const authData = await ViemAccountAuthenticator.authenticate(myAccount);

    console.log('✅ EOA Authentication created');
    console.log('🔑 Auth Method Type:', authData.authMethodType);
    console.log('🆔 Auth Method ID:', authData.authMethodId);

    // Step 3: Test WITHOUT storage first (baseline)
    console.log(
      '\n🐌 First call WITHOUT storage (baseline - all contract calls)...'
    );
    const startTime1 = Date.now();

    const noStorageResult = await litClient.viewPKPsByAuthData({
      authData: {
        authMethodType: authData.authMethodType,
        authMethodId: authData.authMethodId,
      },
      pagination: {
        limit: 5,
        offset: 0,
      },
    });

    const duration1 = Date.now() - startTime1;
    console.log(`⏱️  First call completed in ${duration1}ms`);
    console.log(
      `📊 Found ${noStorageResult.pagination.total} total PKPs, showing first 5`
    );

    // Step 4: Test WITH granular caching storage
    console.log(
      '\n🚀 Second call WITH granular caching (token IDs + individual PKP details)...'
    );

    // Create storage provider that supports granular caching
    const storageProvider = localStorageNode({
      appName: 'pkp-demo',
      networkName: 'naga-dev',
      storagePath: './lit-cache',
    });

    const startTime2 = Date.now();

    const cachedResult = await litClient.viewPKPsByAuthData({
      authData: {
        authMethodType: authData.authMethodType,
        authMethodId: authData.authMethodId,
      },
      pagination: {
        limit: 5,
        offset: 0,
      },
      storageProvider,
    });

    const duration2 = Date.now() - startTime2;
    console.log(`⏱️  Second call completed in ${duration2}ms`);

    // Step 5: Test different pagination range (should use cached data)
    console.log(
      '\n⚡ Third call with different pagination (should use cached token list + granular PKP cache)...'
    );
    const startTime3 = Date.now();

    const paginatedResult = await litClient.viewPKPsByAuthData({
      authData: {
        authMethodType: authData.authMethodType,
        authMethodId: authData.authMethodId,
      },
      pagination: {
        limit: 3,
        offset: 2, // Different offset
      },
      storageProvider,
    });

    const duration3 = Date.now() - startTime3;
    console.log(`⚡ Third call completed in ${duration3}ms`);

    // Step 6: Test cache hit for overlapping pagination
    console.log(
      '\n🎯 Fourth call with overlapping pagination (should hit granular cache)...'
    );
    const startTime4 = Date.now();

    const overlapResult = await litClient.viewPKPsByAuthData({
      authData: {
        authMethodType: authData.authMethodType,
        authMethodId: authData.authMethodId,
      },
      pagination: {
        limit: 4,
        offset: 1, // Overlaps with previous calls
      },
      storageProvider,
    });

    const duration4 = Date.now() - startTime4;
    console.log(`⚡ Fourth call completed in ${duration4}ms`);

    // Step 7: Performance comparison
    console.log('\n📈 Performance Results:');
    console.log(`   No cache (baseline):       ${duration1}ms`);
    console.log(`   First cached call:         ${duration2}ms`);
    console.log(`   Different pagination:      ${duration3}ms`);
    console.log(`   Overlapping pagination:    ${duration4}ms`);
    console.log('');
    console.log('   Performance Improvements:');
    console.log(
      `   Cache vs no cache:         ${(duration1 / duration2).toFixed(
        1
      )}x improvement`
    );
    console.log(
      `   Granular cache hits:       ${(duration1 / duration3).toFixed(
        1
      )}x improvement`
    );

    // Step 8: Show sample results
    console.log('\n📋 Sample Results from Different Pagination:');
    overlapResult.pkps.forEach((pkp, index) => {
      console.log(`🏷️  PKP ${overlapResult.pagination.offset + index + 1}:`);
      console.log(`   Token ID: ${pkp.tokenId.slice(0, 20)}...`);
      console.log(`   Public Key: ${pkp.publicKey.slice(0, 20)}...`);
      console.log(`   ETH Address: ${pkp.ethAddress}`);
    });

    console.log('\n🎉 Granular caching demo completed successfully!');
    console.log('\n💡 Key Benefits of Granular Caching:');
    console.log('   ✅ Respects pagination properly');
    console.log('   ✅ Only fetches needed PKP details');
    console.log('   ✅ Caches individual token PKP data');
    console.log('   ✅ Fast for overlapping pagination ranges');
    console.log('   ✅ Efficient for large PKP collections');
    console.log('   ✅ Backwards compatible with token ID caching');
  } catch (error) {
    console.error('❌ Error in getPKPsFlow:', error);
    throw error;
  }
};

// Automatically run the flow
getPKPsFlow();

/**
 * Example demonstrating PKP retrieval by owner address with caching and pagination
 */
async function demonstratePKPsByAddressCaching() {
  console.log('\n🔍 === PKPs by Address Caching Demo ===');

  // Initialize the setup
  const { init } = await import('./init');
  const { litClient } = await init();

  const ownerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Example address
  
  // Create storage provider for caching
  const storageProvider = localStorage({
    appName: 'lit-pkp-demo',
    networkName: 'naga-dev',
  });

  console.log('\n📊 Baseline (no cache):');
  const start1 = Date.now();
  const result1 = await litClient.viewPKPsByAddress({
    ownerAddress,
    pagination: { limit: 5, offset: 0 },
  });
  const time1 = Date.now() - start1;
  console.log(`⏱️  Time: ${time1}ms`);
  console.log(`📦 Found ${result1.pkps.length} PKPs (total: ${result1.pagination.total})`);
  console.log(`🔄 Has more: ${result1.pagination.hasMore}`);

  console.log('\n💾 First call with caching:');
  const start2 = Date.now();
  const result2 = await litClient.viewPKPsByAddress({
    ownerAddress,
    pagination: { limit: 5, offset: 0 },
    storageProvider,
  });
  const time2 = Date.now() - start2;
  console.log(`⏱️  Time: ${time2}ms`);
  console.log(`📦 Found ${result2.pkps.length} PKPs (total: ${result2.pagination.total})`);

  console.log('\n⚡ Second call with cache (different pagination):');
  const start3 = Date.now();
  const result3 = await litClient.viewPKPsByAddress({
    ownerAddress,
    pagination: { limit: 3, offset: 2 },
    storageProvider,
  });
  const time3 = Date.now() - start3;
  console.log(`⏱️  Time: ${time3}ms`);
  console.log(`📦 Found ${result3.pkps.length} PKPs (offset: 2, limit: 3)`);

  console.log('\n🎯 Overlapping pagination (should be very fast):');
  const start4 = Date.now();
  const result4 = await litClient.viewPKPsByAddress({
    ownerAddress,
    pagination: { limit: 4, offset: 1 },
    storageProvider,
  });
  const time4 = Date.now() - start4;
  console.log(`⏱️  Time: ${time4}ms`);
  console.log(`📦 Found ${result4.pkps.length} PKPs (offset: 1, limit: 4)`);

  console.log('\n📈 Performance Summary:');
  console.log(`Baseline: ${time1}ms`);
  console.log(`First cached: ${time2}ms`);
  console.log(`Different pagination: ${time3}ms`);
  console.log(`Overlapping pagination: ${time4}ms`);
  console.log(`🚀 Cache speedup: ${Math.round((time1 / time4) * 100) / 100}x faster`);
}
