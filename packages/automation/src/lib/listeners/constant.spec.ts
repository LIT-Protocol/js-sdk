import { ConstantListener } from './constant';

describe('ConstantListener', () => {
  let constantListener: ConstantListener<number>;
  const valueToEmit = 42;

  beforeEach(() => {
    constantListener = new ConstantListener(valueToEmit);
  });

  it('should emit the constant value immediately when started', async () => {
    const callback = jest.fn();
    constantListener.onStateChange(callback);

    await constantListener.start();

    // Advance event loop
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(callback).toHaveBeenCalledWith(valueToEmit);
  });

  it('should not emit any value after being stopped', async () => {
    const callback = jest.fn();
    constantListener.onStateChange(callback);

    await constantListener.start();
    await constantListener.stop();

    // Advance event loop
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Ensure no additional calls were made after stop
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
