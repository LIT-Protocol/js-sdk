/**
 * PaymentManager.ts
 *
 * A comprehensive manager for Ledger contract payments that provides a unified interface
 * for managing deposits, withdrawals, and balance queries.
 *
 * This class wraps the individual payment handler functions and provides
 * a clean, object-oriented interface for interacting with the Ledger contract.
 *
 * Usage:
 * ```typescript
 * // Create a new PaymentManager
 * const paymentManager = new PaymentManager(
 *   networkContext,
 *   accountOrWalletClient
 * );
 *
 * // Deposit funds
 * await paymentManager.deposit({ amountInEth: "0.1" });
 *
 * // Check balance
 * const balance = await paymentManager.getBalance({ userAddress: "0x..." });
 * ```
 */

import { formatEther, parseEther } from 'viem';
import { logger } from '../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../interfaces/NetworkContext';
import { ExpectedAccountOrWalletClient } from '../../../contract-manager/createContractsManager';
import { getBalance } from '../../rawContractApis/ledger/read/getBalance';
import { getStableBalance } from '../../rawContractApis/ledger/read/getStableBalance';
import { getWithdrawRequest, WithdrawRequest } from '../../rawContractApis/ledger/read/getWithdrawRequest';
import { getUserWithdrawDelay } from '../../rawContractApis/ledger/read/getUserWithdrawDelay';
import { deposit } from '../../rawContractApis/ledger/write/deposit';
import { depositForUser } from '../../rawContractApis/ledger/write/depositForUser';
import { requestWithdraw } from '../../rawContractApis/ledger/write/requestWithdraw';
import { withdraw } from '../../rawContractApis/ledger/write/withdraw';
import { LitTxVoid } from '../../types';
import { getPayers } from '../../rawContractApis/paymentDelegation/read/getPayers';
import { getUsers } from '../../rawContractApis/paymentDelegation/read/getUsers';
import { getRestriction, Restriction } from '../../rawContractApis/paymentDelegation/read/getRestriction';
import { getPayersAndRestrictions } from '../../rawContractApis/paymentDelegation/read/getPayersAndRestrictions';
import { delegatePayments } from '../../rawContractApis/paymentDelegation/write/delegatePayments';
import { undelegatePayments } from '../../rawContractApis/paymentDelegation/write/undelegatePayments';
import { delegatePaymentsBatch } from '../../rawContractApis/paymentDelegation/write/delegatePaymentsBatch';
import { undelegatePaymentsBatch } from '../../rawContractApis/paymentDelegation/write/undelegatePaymentsBatch';
import { setRestriction } from '../../rawContractApis/paymentDelegation/write/setRestriction';

export interface PaymentBalance {
  /** Total balance including pending withdrawals */
  totalBalance: string;
  /** Available balance (excluding pending withdrawals) */
  availableBalance: string;
  /** Balance amounts in Wei */
  raw: {
    totalBalance: bigint;
    availableBalance: bigint;
  };
}

export interface WithdrawRequestInfo {
  /** Timestamp when the withdrawal was requested */
  timestamp: string;
  /** Amount requested for withdrawal in ETH */
  amount: string;
  /** Whether there's a pending withdrawal request */
  isPending: boolean;
  /** Raw values */
  raw: WithdrawRequest;
}

export class PaymentManager {
  private networkContext: DefaultNetworkConfig;
  private accountOrWalletClient: ExpectedAccountOrWalletClient;

  /**
   * Creates a new Payment manager instance
   *
   * @param networkContext - Network context for contract interactions
   * @param accountOrWalletClient - Account or wallet client for transactions
   */
  constructor(
    networkContext: DefaultNetworkConfig,
    accountOrWalletClient: ExpectedAccountOrWalletClient
  ) {
    this.networkContext = networkContext;
    this.accountOrWalletClient = accountOrWalletClient;
  }

  /**
   * Deposit funds to your own account
   * @param params - Deposit parameters
   * @returns Transaction result
   */
  async deposit(params: { amountInEth: string }): Promise<LitTxVoid> {
    logger.debug('Depositing funds', { amountInEth: params.amountInEth });
    
    const amountInWei = parseEther(params.amountInEth);
    
    return await deposit(
      { amountInWei },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Deposit funds for another user's account
   * @param params - Deposit parameters including user address
   * @returns Transaction result
   */
  async depositForUser(params: { 
    userAddress: string; 
    amountInEth: string 
  }): Promise<LitTxVoid> {
    logger.debug('Depositing funds for user', { 
      userAddress: params.userAddress,
      amountInEth: params.amountInEth 
    });
    
    const amountInWei = parseEther(params.amountInEth);
    
    return await depositForUser(
      { 
        userAddress: params.userAddress,
        amountInWei 
      },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Get balance information for a user
   * @param params - Parameters containing user address
   * @returns Balance information in ETH and Wei
   */
  async getBalance(params: { userAddress: string }): Promise<PaymentBalance> {
    logger.debug('Getting balance', { userAddress: params.userAddress });
    
    const [totalBalanceWei, availableBalanceWei] = await Promise.all([
      getBalance({ userAddress: params.userAddress }, this.networkContext, this.accountOrWalletClient),
      getStableBalance({ userAddress: params.userAddress }, this.networkContext, this.accountOrWalletClient)
    ]);

    return {
      totalBalance: formatEther(totalBalanceWei),
      availableBalance: formatEther(availableBalanceWei),
      raw: {
        totalBalance: totalBalanceWei,
        availableBalance: availableBalanceWei,
      }
    };
  }

  /**
   * Request a withdrawal
   * @param params - Withdrawal request parameters
   * @returns Transaction result
   */
  async requestWithdraw(params: { amountInEth: string }): Promise<LitTxVoid> {
    logger.debug('Requesting withdrawal', { amountInEth: params.amountInEth });
    
    const amountInWei = parseEther(params.amountInEth);
    
    return await requestWithdraw(
      { amountInWei },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Execute a withdrawal (after delay period)
   * @param params - Withdrawal execution parameters
   * @returns Transaction result
   */
  async withdraw(params: { amountInEth: string }): Promise<LitTxVoid> {
    logger.debug('Executing withdrawal', { amountInEth: params.amountInEth });
    
    const amountInWei = parseEther(params.amountInEth);
    
    return await withdraw(
      { amountInWei },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Get withdrawal request information for a user
   * @param params - Parameters containing user address
   * @returns Withdrawal request information
   */
  async getWithdrawRequest(params: { userAddress: string }): Promise<WithdrawRequestInfo> {
    logger.debug('Getting withdrawal request', { userAddress: params.userAddress });
    
    const withdrawRequest = await getWithdrawRequest(
      { userAddress: params.userAddress },
      this.networkContext,
      this.accountOrWalletClient
    );

    const isPending = withdrawRequest.timestamp > 0n && withdrawRequest.amount > 0n;

    return {
      timestamp: withdrawRequest.timestamp.toString(),
      amount: formatEther(withdrawRequest.amount),
      isPending,
      raw: withdrawRequest,
    };
  }

  /**
   * Get the withdrawal delay in seconds
   * @returns Withdrawal delay in seconds
   */
  async getWithdrawDelay(): Promise<{ delaySeconds: string; raw: bigint }> {
    logger.debug('Getting withdrawal delay');
    
    const delayWei = await getUserWithdrawDelay(
      this.networkContext,
      this.accountOrWalletClient
    );

    return {
      delaySeconds: delayWei.toString(),
      raw: delayWei,
    };
  }

  /**
   * Check if a withdrawal request can be executed
   * @param params - Parameters containing user address
   * @returns Whether the withdrawal can be executed and time remaining
   */
  async canExecuteWithdraw(params: { userAddress: string }): Promise<{
    canExecute: boolean;
    timeRemaining?: number;
    withdrawRequest: WithdrawRequestInfo;
  }> {
    logger.debug('Checking if withdrawal can be executed', { userAddress: params.userAddress });
    
    const [withdrawRequest, delay] = await Promise.all([
      this.getWithdrawRequest(params),
      this.getWithdrawDelay()
    ]);

    if (!withdrawRequest.isPending) {
      return {
        canExecute: false,
        withdrawRequest,
      };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const requestTime = Number(withdrawRequest.timestamp);
    const delaySeconds = Number(delay.delaySeconds);
    const executeTime = requestTime + delaySeconds;
    const timeRemaining = executeTime - currentTime;

    return {
      canExecute: timeRemaining <= 0,
      timeRemaining: timeRemaining > 0 ? timeRemaining : undefined,
      withdrawRequest,
    };
  }

  // ========== Payment Delegation Methods ==========

  /**
   * Delegate payments to a user
   * @param params - Parameters containing user address
   * @returns Transaction result
   */
  async delegatePayments(params: { userAddress: string }): Promise<LitTxVoid> {
    logger.debug('Delegating payments to user', { userAddress: params.userAddress });
    
    return await delegatePayments(
      { userAddress: params.userAddress },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Undelegate payments from a user
   * @param params - Parameters containing user address
   * @returns Transaction result
   */
  async undelegatePayments(params: { userAddress: string }): Promise<LitTxVoid> {
    logger.debug('Undelegating payments from user', { userAddress: params.userAddress });
    
    return await undelegatePayments(
      { userAddress: params.userAddress },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Delegate payments to multiple users
   * @param params - Parameters containing array of user addresses
   * @returns Transaction result
   */
  async delegatePaymentsBatch(params: { userAddresses: string[] }): Promise<LitTxVoid> {
    logger.debug('Delegating payments to multiple users', { userAddresses: params.userAddresses });
    
    return await delegatePaymentsBatch(
      { userAddresses: params.userAddresses },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Undelegate payments from multiple users
   * @param params - Parameters containing array of user addresses
   * @returns Transaction result
   */
  async undelegatePaymentsBatch(params: { userAddresses: string[] }): Promise<LitTxVoid> {
    logger.debug('Undelegating payments from multiple users', { userAddresses: params.userAddresses });
    
    return await undelegatePaymentsBatch(
      { userAddresses: params.userAddresses },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Set payment restriction for the caller
   * @param params - Restriction parameters
   * @returns Transaction result
   */
  async setRestriction(params: {
    totalMaxPrice: string;
    requestsPerPeriod: string;
    periodSeconds: string;
  }): Promise<LitTxVoid> {
    logger.debug('Setting payment restriction', params);
    
    return await setRestriction(
      {
        restriction: {
          totalMaxPrice: BigInt(params.totalMaxPrice),
          requestsPerPeriod: BigInt(params.requestsPerPeriod),
          periodSeconds: BigInt(params.periodSeconds),
        }
      },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Get payers for a user
   * @param params - Parameters containing user address
   * @returns Array of payer addresses
   */
  async getPayers(params: { userAddress: string }): Promise<string[]> {
    logger.debug('Getting payers for user', { userAddress: params.userAddress });
    
    return await getPayers(
      { userAddress: params.userAddress },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Get users for a payer
   * @param params - Parameters containing payer address
   * @returns Array of user addresses
   */
  async getUsers(params: { payerAddress: string }): Promise<string[]> {
    logger.debug('Getting users for payer', { payerAddress: params.payerAddress });
    
    return await getUsers(
      { payerAddress: params.payerAddress },
      this.networkContext,
      this.accountOrWalletClient
    );
  }

  /**
   * Get restriction for a payer
   * @param params - Parameters containing payer address
   * @returns Restriction object
   */
  async getRestriction(params: { payerAddress: string }): Promise<{
    totalMaxPrice: string;
    requestsPerPeriod: string;
    periodSeconds: string;
    raw: Restriction;
  }> {
    logger.debug('Getting restriction for payer', { payerAddress: params.payerAddress });
    
    const restriction = await getRestriction(
      { payerAddress: params.payerAddress },
      this.networkContext,
      this.accountOrWalletClient
    );

    return {
      totalMaxPrice: restriction.totalMaxPrice.toString(),
      requestsPerPeriod: restriction.requestsPerPeriod.toString(),
      periodSeconds: restriction.periodSeconds.toString(),
      raw: restriction,
    };
  }

  /**
   * Get payers and restrictions for multiple users
   * @param params - Parameters containing array of user addresses
   * @returns Object containing arrays of payers and restrictions
   */
  async getPayersAndRestrictions(params: { userAddresses: string[] }): Promise<{
    payers: string[][];
    restrictions: Array<Array<{
      totalMaxPrice: string;
      requestsPerPeriod: string;
      periodSeconds: string;
    }>>;
    raw: {
      payers: string[][];
      restrictions: Restriction[][];
    };
  }> {
    logger.debug('Getting payers and restrictions for users', { userAddresses: params.userAddresses });
    
    const result = await getPayersAndRestrictions(
      { userAddresses: params.userAddresses },
      this.networkContext,
      this.accountOrWalletClient
    );

    const formattedRestrictions = result.restrictions.map(userRestrictions =>
      userRestrictions.map(restriction => ({
        totalMaxPrice: restriction.totalMaxPrice.toString(),
        requestsPerPeriod: restriction.requestsPerPeriod.toString(),
        periodSeconds: restriction.periodSeconds.toString(),
      }))
    );

    return {
      payers: result.payers,
      restrictions: formattedRestrictions,
      raw: result,
    };
  }
} 