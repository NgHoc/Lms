/**
 * useBodyScrollLock
 * Locks/unlocks body scroll when a modal is visible.
 * Call this hook at the top of any component that renders a modal.
 *
 * @param {boolean} isOpen - Whether the modal/dialog is visible.
 */
import { useEffect } from 'react';

export function useBodyScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    document.body.classList.add('modal-open');

    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.style.removeProperty('--scrollbar-width');
    };
  }, [isOpen]);
}

export default useBodyScrollLock;
