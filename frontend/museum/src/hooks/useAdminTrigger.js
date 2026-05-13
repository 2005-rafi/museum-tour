import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const CLICK_COUNT = 5;
const CLICK_WINDOW_MS = 3000;

/**
 * useAdminTrigger — hidden admin access activation system.
 *
 * Trigger 1: Clicking the branded logo element 5 times within 3 seconds.
 * Trigger 2: Pressing CTRL + SHIFT + A.
 *
 * When triggered:
 *   1. Sets adminAccessMode = true in AuthContext
 *   2. Navigates to /admin/login
 *
 * Returns a `logoClickHandler` to attach to the logo element's onClick.
 */
export function useAdminTrigger() {
  const navigate = useNavigate();
  const { setAdminAccessMode } = useAuth();
  const clickTimestamps = useRef([]);

  const activate = useCallback(() => {
    setAdminAccessMode(true);
    navigate('/admin/login');
  }, [setAdminAccessMode, navigate]);

  // ── Trigger 1: Logo click counter ─────────────────────────────────────────
  const logoClickHandler = useCallback(() => {
    const now = Date.now();
    clickTimestamps.current.push(now);

    // Keep only clicks within the time window
    clickTimestamps.current = clickTimestamps.current.filter(
      (t) => now - t <= CLICK_WINDOW_MS,
    );

    if (clickTimestamps.current.length >= CLICK_COUNT) {
      clickTimestamps.current = [];
      activate();
    }
  }, [activate]);

  // ── Trigger 2: CTRL + SHIFT + A keyboard shortcut ────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        activate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activate]);

  return { logoClickHandler };
}
