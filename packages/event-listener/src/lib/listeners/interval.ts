import { Listener } from './listener';

export class IntervalListener<T> extends Listener<T> {
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(callback: () => Promise<T>, interval = 1000) {
    super({
      start: async () => {
        this.intervalId = setInterval(async () => {
          const value = await callback();
          this.emit(value);
        }, interval);
      },
      stop: async () => {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      },
    });
  }
}
