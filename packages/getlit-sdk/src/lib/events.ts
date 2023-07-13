import { PKPInfo } from './types';

type StatusMessage = 'pending' | 'in_progress' | 'completed' | 'failed';

export namespace LitDispatch {
  export function createAccountStatus(
    status: StatusMessage,
    data: Array<PKPInfo> | null = null
  ) {
    const EVENT_NAME = 'lit_create_account_status';

    const eventDetail = {
      status: status,
      data: data,
    };

    if (typeof window !== 'undefined') {
      // Running in a browser
      const event = new CustomEvent(EVENT_NAME, {
        detail: eventDetail,
      });

      window.dispatchEvent(event);
    } else if (typeof global !== 'undefined') {
      // Running in Node.js
      const EventEmitter = require('events');
      const eventEmitter = new EventEmitter();

      eventEmitter.emit(EVENT_NAME, eventDetail);
    }
  }
}
