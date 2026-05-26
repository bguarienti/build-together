import { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppContextProvider');
  }

  return context;
}
