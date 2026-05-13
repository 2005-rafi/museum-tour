import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { useDebounce } from '../hooks/useDebounce';

// ─── State shape ──────────────────────────────────────────────────────────────

const initialState = {
  search: '',
  period: '',
  page:   1,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function artifactReducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH': return { ...state, search: action.payload, page: 1 };
    case 'SET_PERIOD': return { ...state, period: action.payload, page: 1 };
    case 'SET_PAGE':   return { ...state, page:   action.payload };
    case 'RESET':      return initialState;
    default:           return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ArtifactContext = createContext(null);

export function ArtifactProvider({ children }) {
  const [state, dispatch] = useReducer(artifactReducer, initialState);
  const debouncedSearch   = useDebounce(state.search, 400);

  const setSearch  = useCallback((v) => dispatch({ type: 'SET_SEARCH', payload: v }), []);
  const setPeriod  = useCallback((v) => dispatch({ type: 'SET_PERIOD', payload: v }), []);
  const setPage    = useCallback((v) => dispatch({ type: 'SET_PAGE',   payload: v }), []);
  const reset      = useCallback(()  => dispatch({ type: 'RESET' }), []);

  const value = useMemo(
    () => ({
      search:  state.search,
      period:  state.period,
      page:    state.page,
      debouncedSearch,
      setSearch,
      setPeriod,
      setPage,
      reset,
    }),
    [state, debouncedSearch, setSearch, setPeriod, setPage, reset],
  );

  return (
    <ArtifactContext.Provider value={value}>
      {children}
    </ArtifactContext.Provider>
  );
}

/**
 * Returns the artifact filter state + setters.
 * Must be used inside <ArtifactProvider>.
 */
export function useArtifactFilters() {
  const ctx = useContext(ArtifactContext);
  if (!ctx) throw new Error('useArtifactFilters must be used inside ArtifactProvider');
  return ctx;
}

export default ArtifactContext;
