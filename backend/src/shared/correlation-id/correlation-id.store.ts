import { AsyncLocalStorage } from 'node:async_hooks';

interface CorrelationIdContext {
  correlationId: string;
}

export class CorrelationIdStore {
  private static readonly asyncLocalStorage =
    new AsyncLocalStorage<CorrelationIdContext>();

  static run(correlationId: string, callback: () => void): void {
    this.asyncLocalStorage.run({ correlationId }, callback);
  }

  static getCorrelationId(): string | undefined {
    return this.asyncLocalStorage.getStore()?.correlationId;
  }
}
