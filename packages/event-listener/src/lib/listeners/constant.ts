import { Listener } from './listener';

/**
 * A simple listener that emits a constant value immediately when started
 */
export class ConstantListener<T> extends Listener<T> {
  constructor(private value: T) {
    super({
      start: async () => {
        // Emit value on next tick simulating a state change and respecting event architecture
        setTimeout(() => {
          this.emit(this.value);
        }, 0);
      },
    });
  }
}
