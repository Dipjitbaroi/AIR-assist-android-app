/**
 * Store Index
 * 
 * Centralizes and exports all context providers.
 * This allows for easier imports in components.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import AppContext, { AppProvider } from './AppContext';
import BluetoothContext, { BluetoothProvider } from './BluetoothContext';

/**
 * Root Provider Component
 * 
 * Combines all context providers into a single component.
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
const RootProvider = ({ children }) => {
  return (
    <AppProvider>
      <BluetoothProvider>
        {children}
      </BluetoothProvider>
    </AppProvider>
  );
};

export {
  AppContext,
  AppProvider,
  BluetoothContext,
  BluetoothProvider,
  RootProvider,
};

export default RootProvider;
