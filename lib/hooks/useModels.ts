"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook to fetch models from the API with SWR caching
 * @param type - Model type filter (optional)
 * @returns { models, isLoading, error, mutate }
 */
export function useModels(type?: string) {
  const url = type ? `/api/models?type=${type}` : '/api/models';

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    revalidateOnFocus: false,
    dedupingInterval: 60 * 1000, // Dedupe requests within 1 minute
  });

  return {
    models: data?.models || [],
    isLoading,
    error,
    mutate, // Allow manual refresh
  };
}
