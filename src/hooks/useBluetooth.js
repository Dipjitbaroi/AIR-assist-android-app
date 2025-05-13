/**
 * useBluetooth Hook
 * 
 * A custom hook for managing Bluetooth functionality.
 * Provides a simplified interface for scanning, connecting, and communicating with Bluetooth devices.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { PermissionsService } from '../services/PermissionsService';
import { BT_CONNECTION_STATES } from '../config/constants';

// Create a single instance of BleManager
const bleManager = new BleManager();

/**
 * Bluetooth hook
 * 
 * @returns {Object} Bluetooth state and functions
 */
const useBluetooth = () => {
  // State for Bluetooth availability
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State for scanning
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  
  // State for connection
  const [connectionState, setConnectionState] = useState(BT_CONNECTION_STATES.DISCONNECTED);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [previousDevices, setPreviousDevices] = useState([]);
  
  // State for errors
  const [error, setError] = useState(null);
  
  /**
   * Initialize Bluetooth functionality
   */
  const initialize = useCallback(async () => {
    try {
      // Check permissions first
      const hasPermissions = await PermissionsService.hasBluetoothPermissions();
      
      if (!hasPermissions) {
        setError('Bluetooth permissions not granted');
        setConnectionState(BT_CONNECTION_STATES.ERROR);
        return false;
      }
      
      // Check if Bluetooth is enabled
      const state = await bleManager.state();
      const enabled = state === 'PoweredOn';
      setIsBluetoothEnabled(enabled);
      
      if (!enabled) {
        setError('Bluetooth is not enabled');
        return false;
      }
      
      // Set up event listeners
      // In a real implementation, we would set up more event listeners here
      
      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err) {
      setError(`Initialization error: ${err.message}`);
      setConnectionState(BT_CONNECTION_STATES.ERROR);
      return false;
    }
  }, []);
  
  /**
   * Start scanning for Bluetooth devices
   */
  const startScan = useCallback(async () => {
    if (!isBluetoothEnabled || !isInitialized) {
      setError('Bluetooth is not available');
      return false;
    }
    
    if (isScanning) {
      return true; // Already scanning
    }
    
    try {
      // Clear previous scan results
      setDiscoveredDevices([]);
      setError(null);
      
      // Start scanning
      setIsScanning(true);
      setConnectionState(BT_CONNECTION_STATES.SCANNING);
      
      // Start scanning with BleManager
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          setError(`Scan error: ${error.message}`);
          stopScan();
          return;
        }
        
        // Only add devices with a name
        if (device && device.name) {
          setDiscoveredDevices(prevDevices => {
            // Check if device already exists in the list
            const exists = prevDevices.some(d => d.id === device.id);
            if (exists) {
              return prevDevices;
            }
            
            // Add new device to the list
            const newDevice = {
              id: device.id,
              name: device.name,
              rssi: device.rssi,
            };
            
            return [...prevDevices, newDevice];
          });
        }
      });
      
      // Set timeout to stop scanning after 10 seconds
      setTimeout(() => {
        if (isScanning) {
          stopScan();
        }
      }, 10000);
      
      return true;
    } catch (err) {
      setError(`Start scan error: ${err.message}`);
      setIsScanning(false);
      setConnectionState(BT_CONNECTION_STATES.ERROR);
      return false;
    }
  }, [isBluetoothEnabled, isInitialized, isScanning]);
  
  /**
   * Stop scanning for Bluetooth devices
   */
  const stopScan = useCallback(() => {
    if (!isScanning) {
      return true;
    }
    
    try {
      bleManager.stopDeviceScan();
      setIsScanning(false);
      
      if (connectedDevice) {
        setConnectionState(BT_CONNECTION_STATES.CONNECTED);
      } else {
        setConnectionState(BT_CONNECTION_STATES.DISCONNECTED);
      }
      
      return true;
    } catch (err) {
      setError(`Stop scan error: ${err.message}`);
      setIsScanning(false);
      return false;
    }
  }, [isScanning, connectedDevice]);
  
  /**
   * Connect to a Bluetooth device
   * 
   * @param {string} deviceId - Device ID to connect to
   * @returns {Promise<boolean>} Whether connection was successful
   */
  const connectToDevice = useCallback(async (deviceId) => {
    if (!isBluetoothEnabled || !isInitialized) {
      setError('Bluetooth is not available');
      return false;
    }
    
    try {
      setConnectionState(BT_CONNECTION_STATES.CONNECTING);
      setError(null);
      
      // Stop scanning if currently scanning
      if (isScanning) {
        stopScan();
      }
      
      // Find the device in our lists
      const device = 
        [...discoveredDevices, ...previousDevices].find(d => d.id === deviceId);
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      // Connect to the device
      const connectedDeviceObj = await bleManager.connectToDevice(deviceId);
      
      // Discover services and characteristics
      await connectedDeviceObj.discoverAllServicesAndCharacteristics();
      
      // Update state
      setConnectedDevice(device);
      setConnectionState(BT_CONNECTION_STATES.CONNECTED);
      
      // Save to history
      setPreviousDevices(prevDevices => {
        // Remove this device if it already exists
        const filteredDevices = prevDevices.filter(d => d.id !== device.id);
        
        // Add to the beginning of the list
        return [device, ...filteredDevices].slice(0, 10); // Keep only 10 most recent
      });
      
      return true;
    } catch (err) {
      setError(`Connection error: ${err.message}`);
      setConnectionState(BT_CONNECTION_STATES.ERROR);
      return false;
    }
  }, [isBluetoothEnabled, isInitialized, isScanning, discoveredDevices, previousDevices, stopScan]);
  
  /**
   * Disconnect from a Bluetooth device
   * 
   * @param {string} deviceId - Device ID to disconnect from
   * @returns {Promise<boolean>} Whether disconnection was successful
   */
  const disconnectFromDevice = useCallback(async (deviceId) => {
    if (!deviceId || !connectedDevice || connectedDevice.id !== deviceId) {
      return true; // Already disconnected
    }
    
    try {
      const device = await bleManager.devices([deviceId]);
      if (device && device.length > 0) {
        await device[0].cancelConnection();
      }
      
      setConnectedDevice(null);
      setConnectionState(BT_CONNECTION_STATES.DISCONNECTED);
      
      return true;
    } catch (err) {
      setError(`Disconnection error: ${err.message}`);
      
      // Still clear the connected device from state
      setConnectedDevice(null);
      setConnectionState(BT_CONNECTION_STATES.DISCONNECTED);
      
      return false;
    }
  }, [connectedDevice]);
  
  /**
   * Send data to a connected Bluetooth device
   * 
   * @param {string} serviceUUID - Service UUID
   * @param {string} characteristicUUID - Characteristic UUID
   * @param {string|Uint8Array} data - Data to send (string or byte array)
   * @returns {Promise<boolean>} Whether data was sent successfully
   */
  const sendData = useCallback(async (serviceUUID, characteristicUUID, data) => {
    if (!connectedDevice) {
      setError('No device connected');
      return false;
    }
    
    try {
      // Convert data to base64 if it's not already
      let base64Data;
      if (typeof data === 'string') {
        base64Data = Buffer.from(data).toString('base64');
      } else if (data instanceof Uint8Array) {
        base64Data = Buffer.from(data).toString('base64');
      } else {
        base64Data = data;
      }
      
      // Write data to characteristic
      await bleManager.writeCharacteristicWithResponseForDevice(
        connectedDevice.id,
        serviceUUID,
        characteristicUUID,
        base64Data
      );
      
      return true;
    } catch (err) {
      setError(`Send data error: ${err.message}`);
      return false;
    }
  }, [connectedDevice]);
  
  /**
   * Read data from a connected Bluetooth device
   * 
   * @param {string} serviceUUID - Service UUID
   * @param {string} characteristicUUID - Characteristic UUID
   * @returns {Promise<string|null>} Data read from device or null if error
   */
  const readData = useCallback(async (serviceUUID, characteristicUUID) => {
    if (!connectedDevice) {
      setError('No device connected');
      return null;
    }
    
    try {
      // Read data from characteristic
      const characteristic = await bleManager.readCharacteristicForDevice(
        connectedDevice.id,
        serviceUUID,
        characteristicUUID
      );
      
      return characteristic.value; // Base64 encoded data
    } catch (err) {
      setError(`Read data error: ${err.message}`);
      return null;
    }
  }, [connectedDevice]);
  
  // Initialize Bluetooth when component mounts
  useEffect(() => {
    initialize();
    
    // Clean up when component unmounts
    return () => {
      if (isScanning) {
        bleManager.stopDeviceScan();
      }
      
      if (connectedDevice) {
        disconnectFromDevice(connectedDevice.id)
          .catch(err => console.error('Error disconnecting on unmount:', err));
      }
    };
  }, []);
  
  return {
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
  };
};

export default useBluetooth;
