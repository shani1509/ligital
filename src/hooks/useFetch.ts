'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/types';

interface UseFetchOptions {
  immediate?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching data from API endpoints.
 * Automatically handles loading, error states, and data.
 */
export function useFetch<T>(
  url: string,
  options: UseFetchOptions = { immediate: true }
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const json: ApiResponse<T> = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.message || 'Failed to fetch data');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Custom hook for making mutations (POST, PUT, DELETE, PATCH).
 */
export function useMutation<TInput, TOutput = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    url: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: TInput
  ): Promise<ApiResponse<TOutput>> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json: ApiResponse<TOutput> = await res.json();
      if (!json.success) {
        setError(json.message || 'Operation failed');
      }
      return json;
    } catch {
      const message = 'Network error. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
