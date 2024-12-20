import { Listener } from './listener';

interface FetchListenerConfig {
  fetchConfig?: RequestInit;
  listenerConfig?: {
    pollInterval?: number;
    pathResponse?: string;
  };
}

export class FetchListener extends Listener<any> {
  private readonly url: string;
  private config: FetchListenerConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(url: string, config: FetchListenerConfig = {}) {
    super({
      start: async () => {
        const { pollInterval = 1000, pathResponse = '' } =
          this.config.listenerConfig ?? {};

        this.intervalId = setInterval(async () => {
          try {
            const response = await fetch(this.url, this.config.fetchConfig);
            const data = await response.json();
            const value = pathResponse
              ? pathResponse
                  .split('.')
                  .reduce((acc, part) => acc && acc[part], data)
              : data;
            if (value !== undefined) {
              this.emit(value);
            }
          } catch (error) {
            console.error('FetchListener error:', error);
          }
        }, pollInterval);
      },
      stop: async () => {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      },
    });
    this.url = url;
    this.config = config;
  }
}
