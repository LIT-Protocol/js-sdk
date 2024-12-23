import { Listener } from './listener';

export class TimerListener extends Listener<number> {
  private intervalId?: ReturnType<typeof setInterval>;
  private count = 0;

  constructor(interval = 1000, offset = 0, step = 1) {
    super({
      start: async () => {
        this.intervalId = setInterval(() => {
          this.count += step;
          this.emit(this.count);
        }, interval);
      },
      stop: async () => {
        this.count = offset;
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      },
    });

    this.count = offset;
  }
}
