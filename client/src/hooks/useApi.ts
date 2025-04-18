import { useState, useCallback, useEffect } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type ApiFunction<T, P> = (params: P) => Promise<T>;

/**
 * Custom hook for API calls
 */
export function useApi<T, P>(apiFunction: ApiFunction<T, P>) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (params: P) => {
      setState({ data: null, loading: true, error: null });
      
      try {
        const data = await apiFunction(params);
        setState({ data, loading: false, error: null });
        return { data, error: null };
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: errorObj });
        return { data: null, error: errorObj };
      }
    },
    [apiFunction]
  );

  return { ...state, execute };
}

/**
 * Custom hook for API calls that execute on mount
 */
export function useApiOnMount<T, P>(
  apiFunction: ApiFunction<T, P>,
  params: P,
  deps: any[] = []
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(
    async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const data = await apiFunction(params);
        setState({ data, loading: false, error: null });
        return { data, error: null };
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, loading: false, error: errorObj }));
        return { data: null, error: errorObj };
      }
    },
    [apiFunction, params]
  );

  useEffect(() => {
    refetch();
  }, [...deps, refetch]);

  return { ...state, refetch };
}