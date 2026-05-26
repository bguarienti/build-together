import { useEffect, useCallback } from 'react';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';

export function useLocalStorage(state, onStateLoaded) {
  const save = useCallback(() => {
    const success = saveToLocalStorage(state);
    if (!success) {
      console.warn('Failed to save state to localStorage');
    }
  }, [state]);

  const load = useCallback(() => {
    const savedState = loadFromLocalStorage();
    if (savedState) {
      onStateLoaded(savedState);
    }
  }, [onStateLoaded]);

  useEffect(() => {
    save();
  }, [save]);

  return { save, load };
}
