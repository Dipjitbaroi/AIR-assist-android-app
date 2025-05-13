/**
 * useAppContext Hook
 * 
 * A custom hook for accessing the AppContext.
 * Provides a simplified interface for using the app context in components.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { useContext } from 'react';
import { AppContext } from '../store/AppContext';

/**
 * App context hook
 * 
 * @returns {Object} App context value
 * @throws {Error} If used outside of AppProvider
 */
const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};

export default useAppContext;
