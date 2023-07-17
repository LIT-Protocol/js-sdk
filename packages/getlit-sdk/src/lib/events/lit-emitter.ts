import { PKPInfo } from '../types';
import { EventEmitter } from 'events';
import { isBrowser, log } from '../utils';
import { isNode } from '@lit-protocol/misc';
type StatusMessage = 'pending' | 'in_progress' | 'completed' | 'failed';

export class LitEmitter {
  events = {
    createAccountStatus: 'lit_create_account_status',
    getAccountsStatus: 'lit_get_account_status',
  };

  constructor() {
    log.start('LitEmitter', 'initializing...');
  }

  emit(eventName: string, ...args: any[]) {
    log.info(`emitting event: ${eventName}`);

    if (isBrowser()) {
      const event = new CustomEvent(eventName, {
        detail: args,
      });
      window.dispatchEvent(event);
    }

    if (isNode()) {
      const eventEmitter = new EventEmitter();
      eventEmitter.emit(eventName, args);
    }
  }

  createAccountStatus(
    status: StatusMessage,
    data: Array<PKPInfo> | null = null
  ) {
    this.emit(this.events.createAccountStatus, {
      status: status,
      data: data,
    });
  }

  getAccountsStatus(status: StatusMessage, data: Array<PKPInfo> | null = null) {
    this.emit(this.events.getAccountsStatus, {
      status: status,
      data: data,
    });
  }
}
