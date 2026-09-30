import { useEffect, useEffectEvent, useState } from "react";

interface LoadedState<T> {
  key: string | null;
  data: T | undefined;
  error: Error | null;
}

export interface AsyncData<T> {
  // The last value loaded. While a new key loads it still holds the previous
  // one, so views can dim instead of flashing empty.
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Loads data identified by `key` (null skips loading) and reloads whenever
 * the key changes — so the key must encode every input of `load`.
 */
export function useAsyncData<T>(key: string | null, load: () => Promise<T>): AsyncData<T> {
  const [state, setState] = useState<LoadedState<T>>({ key: null, data: undefined, error: null });
  const runLoad = useEffectEvent(load);

  useEffect(() => {
    if (key === null) return;

    let cancelled = false;
    runLoad().then(
      (data) => {
        if (!cancelled) setState({ key, data, error: null });
      },
      (error: unknown) => {
        if (!cancelled) {
          setState({
            key,
            data: undefined,
            error: error instanceof Error ? error : new Error("Couldn't load this data."),
          });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [key]);

  return {
    data: state.data,
    error: state.key === key ? state.error : null,
    isLoading: key !== null && state.key !== key,
  };
}
