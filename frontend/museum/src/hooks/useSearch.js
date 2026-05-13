import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import searchService from '../services/searchService';
import { QUERY_KEYS, SEARCH_DEBOUNCE_MS } from '../utils/constants';

/**
 * Server-side search via React Query (URL-driven / on-demand)
 */
export function useSearch(query = '', filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH, query, filters],
    queryFn: () => searchService.search(query, filters),
    enabled: query.trim().length >= 2,
    staleTime: 2 * 60 * 1000,
    placeholderData: { artifacts: [], museums: [] },
  });
}

/**
 * Debounced search hook for live SearchBar input
 * Returns { searchTerm, setSearchTerm, debouncedTerm }
 */
export function useDebouncedSearch(initialValue = '') {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);
  const timerRef = useRef(null);

  const handleChange = useCallback((value) => {
    setSearchTerm(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedTerm(value);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  return { searchTerm, debouncedTerm, setSearchTerm: handleChange };
}
