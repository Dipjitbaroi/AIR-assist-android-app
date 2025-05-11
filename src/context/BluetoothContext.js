import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { BluetoothService } from '../services/BluetoothService';
import { PermissionsService } from '../services/PermissionsService';
import { STORAGE_KEYS } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BluetoothContext = createContext();

export const BluetoothProvider = ({ children }) => {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [connectAttempts, setConnectAttempts] = useState(0);
  const [savedDevices, setSavedDevices] = useState([]);

  // Initialize Bluetooth service
  useEffect(() => {
    const initBluetooth = async () => {
      try {
        await BluetoothService.init();
        
        BluetoothService.onStateChange((state) => {
          setIsBluetoothEnabled(state === 'PoweredOn');
        });

        const initialState = await BluetoothService.getState();
        setIsBluetoothEnabled(initialState === 'PoweredOn');
        
        // Load saved devices
        const loadSavedDevices = async () => {
          try {
            const savedDevicesString = await AsyncStorage.getItem(STORAGE_KEYS.BLUETOOTH_DEVICES);
            if (savedDevicesString) {
              const parsedDevices = JSON.parse(savedDevicesString);
              setSavedDevices(parsedDevices);
              
              // Try to reconnect to the last device if available
              const lastConnectedDevice = parsedDevices.find(device => device.lastConnected);
              if (lastConnectedDevice && initialState === 'PoweredOn') {
                setTimeout(() => {
                  connectToDevice(lastConnectedDevice);
                }, 1000); // Delay to ensure Bluetooth is ready
              }
            }
          } catch (error) {
            console.error('Error loading saved devices:', error);
          }
        };
        
        loadSavedDevices();
      } catch (error) {
        console.error('Bluetooth initialization error:', error);
        setError('Failed to initialize Bluetooth');
      }
    };

    initBluetooth();

    return () => {
      BluetoothService.stopScan();
      if (connectedDevice) {
        BluetoothService.disconnect(connectedDevice.id);
      }
    };
  }, []);

  // Save devices when they change
  useEffect(() => {
    const saveBleDevices = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.BLUETOOTH_DEVICES, JSON.stringify(savedDevices));
      } catch (error) {
        console.error('Error saving BLE devices:', error);
      }
    };

    saveBleDevices();
  }, [savedDevices]);

  // Start scanning for devices
  const startScan = async () => {
    try {
      // Check for necessary permissions first
      if (Platform.OS === 'android') {
        const hasPermissions = await PermissionsService.checkAndroidBluetoothPermissions();
        if (!hasPermissions) {
          await PermissionsService.requestAndroidBluetoothPermissions();
        }
      }

      if (!isBluetoothEnabled) {
        setError('Bluetooth is not enabled');
        return false;
      }

      setIsScanning(true);
      setConnectionState('scanning');
      setDevices([]);
      setScanAttempts(prev => prev + 1);

      BluetoothService.startScan((device) => {
        setDevices(prevDevices => {
          // Only add device if it doesn't already exist in the list
          const exists = prevDevices.some(d => d.id === device.id);
          if (!exists) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      });

      // Stop scan after 10 seconds to save battery
      setTimeout(() => {
        BluetoothService.stopScan();
        setIsScanning(false);
        
        if (devices.length === 0) {
          setConnectionState('no_devices_found');
        } else {
          setConnectionState('devices_found');
        }
      }, 10000);

      return true;
    } catch (error) {
      console.error('Error starting scan:', error);
      setError(`Failed to scan for devices: ${error.message}`);
      setIsScanning(false);
      setConnectionState('error');
      return false;
    }
  };

  // Connect to a device
  const connectToDevice = async (device) => {
    try {
      setConnectionState('connecting');
      setConnectAttempts(prev => prev + 1);
      
      const connected = await BluetoothService.connect(device.id);
      
      if (connected) {
        setConnectedDevice(device);
        setConnectionState('connected');
        
        // Save the device as last connected
        const updatedSavedDevices = savedDevices.map(d => ({
          ...d,
          lastConnected: d.id === device.id
        }));
        
        // Add the device if it doesn't exist in savedDevices
        if (!savedDevices.some(d => d.id === device.id)) {
          updatedSavedDevices.push({
            ...device,
            lastConnected: true
          });
        }
        
        setSavedDevices(updatedSavedDevices);
        
        return true;
      } else {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      setError(`Failed to connect: ${error.message}`);
      setConnectionState('error');
      
      // Retry connection if less than 3 attempts
      if (connectAttempts < 3) {
        setTimeout(() => {
          connectToDevice(device);
        }, 1000);
      } else {
        setConnectAttempts(0);
        return false;
      }
    }
  };

  // Disconnect from device
  const disconnectDevice = async () => {
    try {
      if (connectedDevice) {
        await BluetoothService.disconnect(connectedDevice.id);
        setConnectedDevice(null);
        setConnectionState('disconnected');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error disconnecting device:', error);
      setError(`Failed to disconnect: ${error.message}`);
      return false;
    }
  };

  // Forget device
  const forgetDevice = async (deviceId) => {
    try {
      // Disconnect if connected
      if (connectedDevice && connectedDevice.id === deviceId) {
        await disconnectDevice();
      }
      
      // Remove from saved devices
      setSavedDevices(prev => prev.filter(device => device.id !== deviceId));
      
      return true;
    } catch (error) {
      console.error('Error forgetting device:', error);
      return false;
    }
  };

  // Check if Bluetooth is supported
  const isBluetoothSupported = BluetoothService.isSupported();

  return (
    <BluetoothContext.Provider
      value={{
        isBluetoothSupported,
        isBluetoothEnabled,
        isScanning,
        devices,
        savedDevices,
        connectedDevice,
        connectionState,
        error,
        startScan,
        connectToDevice,
        disconnectDevice,
        forgetDevice,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};
