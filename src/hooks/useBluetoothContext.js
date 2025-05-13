/**
 * useBluetoothContext Hook
 * 
 * A custom hook for accessing the BluetoothContext.
 * Provides a simplified interface for using the Bluetooth context in components.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { useContext } from 'react';
import { BluetoothContext } from '../store/BluetoothContext';

/**
 * Bluetooth context hook
 * 
 * @returns {Object} Bluetooth context value
 * @throws {Error} If used outside of BluetoothProvider
 */
const useBluetoothContext = () => {
  const context = useContext(BluetoothContext);
  
  if (context === undefined) {
    throw new Error('useBluetoothContext must be used within a BluetoothProvider');
  }
  
  return context;
};

export default useBluetoothContext;
