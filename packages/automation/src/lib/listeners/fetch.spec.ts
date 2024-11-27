import { FetchListener } from './fetch';

describe('FetchListener', () => {
  let fetchListener: FetchListener;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: { value: 42 } }),
    });
    global.fetch = fetchMock;

    fetchListener = new FetchListener('http://example.com', {
      fetchConfig: {},
      listenerConfig: {
        pollInterval: 1000,
        pathResponse: 'data.value',
      },
    });
  });

  afterEach(async () => {
    await fetchListener.stop();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should fetch data and emit the correct value', async () => {
    let callbackCalled: () => void;
    const callbackPromise = new Promise<void>(resolve => callbackCalled = resolve);

    const callback = jest.fn(async () => {
      callbackCalled();
    });
    fetchListener.onStateChange(callback);

    await fetchListener.start();
    jest.advanceTimersByTime(1000);
    await callbackPromise;

    expect(fetchMock).toHaveBeenCalledWith('http://example.com', {});
    expect(callback).toHaveBeenCalledWith(42);
  });

  it('should stop polling when stopped', async () => {
    await fetchListener.start();
    await fetchListener.stop();

    jest.advanceTimersByTime(2000);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });
});
