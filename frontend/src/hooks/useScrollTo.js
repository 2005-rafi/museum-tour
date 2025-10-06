import { useCallback } from 'react';

const useScrollTo = () => {
  const scrollTo = useCallback((elementId) => (e) => {
    e.preventDefault();
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return scrollTo;
};

export default useScrollTo; 