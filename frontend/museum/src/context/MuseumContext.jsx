import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import { useDebounce } from '../hooks/useDebounce';

// ─── State shape ──────────────────────────────────────────────────────────────

const initialState = {
  search: '',
  page:   1,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function museumReducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH': return { ...state, search: action.payload, page: 1 };
    case 'SET_PAGE':   return { ...state, page:   action.payload };
    case 'RESET':      return initialState;
    default:           return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MuseumContext = createContext(null);

export function MuseumProvider({ children }) {
  const [state, dispatch] = useReducer(museumReducer, initialState);
  const debouncedSearch   = useDebounce(state.search, 400);

  const setSearch = useCallback((v) => dispatch({ type: 'SET_SEARCH', payload: v }), []);
  const setPage   = useCallback((v) => dispatch({ type: 'SET_PAGE',   payload: v }), []);
  const reset     = useCallback(()  => dispatch({ type: 'RESET' }), []);

  const value = useMemo(
    () => ({
      search: state.search,
      page:   state.page,
      debouncedSearch,
      setSearch,
      setPage,
      reset,
    }),
    [state, debouncedSearch, setSearch, setPage, reset],
  );

  return (
    <MuseumContext.Provider value={value}>
      {children}
    </MuseumContext.Provider>
  );
}

/**
 * Returns the museum filter state + setters.
 * Must be used inside <MuseumProvider>.
 */
export function useMuseumFilters() {
  const ctx = useContext(MuseumContext);
  if (!ctx) throw new Error('useMuseumFilters must be used inside MuseumProvider');
  return ctx;
}

export default MuseumContext;
