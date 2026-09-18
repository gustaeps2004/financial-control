import { CorrelationIdStore } from './correlation-id.store';

describe('CorrelationIdStore', () => {
  it('exposes the correlation id inside the run() callback scope', () => {
    CorrelationIdStore.run('correlation-id-1', () => {
      expect(CorrelationIdStore.getCorrelationId()).toBe('correlation-id-1');
    });
  });

  it('returns undefined outside of any run() scope', () => {
    expect(CorrelationIdStore.getCorrelationId()).toBeUndefined();
  });

  it('keeps concurrent scopes isolated from each other', async () => {
    const readInsideScope = (correlationId: string) =>
      new Promise<string | undefined>((resolve) => {
        CorrelationIdStore.run(correlationId, () => {
          setImmediate(() => resolve(CorrelationIdStore.getCorrelationId()));
        });
      });

    const [first, second] = await Promise.all([
      readInsideScope('correlation-id-a'),
      readInsideScope('correlation-id-b'),
    ]);

    expect(first).toBe('correlation-id-a');
    expect(second).toBe('correlation-id-b');
  });
});
