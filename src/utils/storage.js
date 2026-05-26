const STORAGE_KEY = 'timeblocking-app-v1';

export function saveToLocalStorage(state) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded:', error);
      return false;
    }
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

export function loadFromLocalStorage() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}
