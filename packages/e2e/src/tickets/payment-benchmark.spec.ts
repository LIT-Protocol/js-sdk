import { registerPaymentBenchmarkTests } from '../test-helpers/executeJs/paymentBenchmarks/paymentBenchmark';

/**
 * Payment Benchmark Tests
 *
 * These tests benchmark the cost of executing various Lit Actions
 * that perform different operations with varying execution times.
 *
 * Each test:
 * - Executes a specific Lit Action scenario
 * - Measures payment details (component costs, quantities, prices)
 * - Logs detailed cost breakdown for documentation
 *
 * Test against: naga-test network
 */
registerPaymentBenchmarkTests();
