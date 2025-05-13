/**
 * Bluetooth Context
 * 
 * Provides Bluetooth state management for the application.
 * Manages device scanning, connection, and communication.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React, { createContext, useEffect, useCallback } from 'react';

// Hooks
import { useBluetooth } from '../hooks';

// Utils
import { storage } from '../utils';

// Create context
export const BluetoothContext = createContext();

/**
 * Bluetooth Provider Component
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export const BluetoothProvider = ({ children }) => {
  // Initialize Bluetooth hook
  const {
    // State
    isBluetoothEnabled,
    isInitialized,
    isScanning,
    discoveredDevices,
    connectionState,
    connectedDevice,
    previousDevices,
    error,
    
    // Functions
    initialize,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    sendData,
    readData,
  } = useBluetooth();
  
  /**
   * Load previous devices from storage
   */
  useEffect(() => {
    const loadPreviousDevices = async () => {
      try {
        const devices = await storage.loadBluetoothDevices();
        
        // If auto-connect is enabled and we have previous devices, connect to the first one
        if (isBluetoothEnabled && isInitialized && devices.length > 0) {
          connectToDevice(devices[0].id)
            .catch(err => console.warn('Auto-connect failed:', err));
        }
      } catch (error) {
        console.error('Error loading previous devices:', error);
      }
    };
    
    if (isInitialized) {
      loadPreviousDevices();
    }
  }, [isInitialized, isBluetoothEnabled, connectToDevice]);
  
  /**
   * Save devices when they change
   */
  useEffect(() => {
    if (previousDevices.length > 0) {
      storage.saveBluetoothDevices(previousDevices);
    }
  }, [previousDevices]);
  
  /**
   * Connect to a device by ID
   * 
   * @param {string} deviceId - Device ID to connect to
   * @returns {Promise<boolean>} Whether connection was successful
   */
  const handleConnectToDevice = useCallback(async (deviceId) => {
    try {
      const success = await connectToDevice(deviceId);
      return success;
    } catch (error) {
      console.error(`Error connecting to device ${deviceId}:`, error);
      return false;
    }
  }, [connectToDevice]);
  
  /**
   * Disconnect from the current device
   * 
   * @returns {Promise<boolean>} Whether disconnection was successful
   */
  const handleDisconnectFromDevice = useCallback(async () => {
    if (!connectedDevice) {
      return true;
    }
    
    try {
      const success = await disconnectFromDevice(connectedDevice.id);
      return success;
    } catch (error) {
      console.error(`Error disconnecting from device ${connectedDevice.id}:`, error);
      return false;
    }
  }, [connectedDevice, disconnectFromDevice]);
  
  /**
   * Start scanning for devices
   * 
   * @returns {Promise<boolean>} Whether scan started successfully
   */
  const handleStartScan = useCallback(async () => {
    try {
      const success = await startScan();
      return success;
    } catch (error) {
      console.error('Error starting scan:', error);
      return false;
    }
  }, [startScan]);
  
  /**
   * Send data to the connected device
   * 
   * @param {string} serviceUUID - Service UUID
   * @param {string} characteristicUUID - Characteristic UUID
   * @param {string|Uint8Array} data - Data to send
   * @returns {Promise<boolean>} Whether data was sent successfully
   */
  const handleSendData = useCallback(async (serviceUUID, characteristicUUID, data) => {
    try {
      const success = await sendData(serviceUUID, characteristicUUID, data);
      return success;
    } catch (error) {
      console.error('Error sending data:', error);
      return false;
    }
  }, [sendData]);
  
  /**
   * Read data from the connected device
   * 
   * @param {string} serviceUUID - Service UUID
   * @param {string} characteristicUUID - Characteristic UUID
   * @returns {Promise<string|null>} Data read from device or null if error
   */
  const handleReadData = useCallback(async (serviceUUID, characteristicUUID) => {
    try {
      const data = await readData(serviceUUID, characteristicUUID);
      return data;
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  }, [readData]);
  
  // Context value
  const contextValue = {
    // State
    isBluetoothEnabled,
    isInitialized,
    isScanning,
    discoveredDevices,
    connectionState,
    connectedDevice,
    previousDevices,
    error,
    
    // Functions
    initialize,
    startScan: handleStartScan,
    stopScan,
    connectToDevice: handleConnectToDevice,
    disconnectFromDevice: handleDisconnectFromDevice,
    sendData: handleSendData,
    readData: handleReadData,
  };
  
  return (
    <BluetoothContext.Provider value={contextValue}>
      {children}
    </BluetoothContext.Provider>
  );
};

export default BluetoothContext;
