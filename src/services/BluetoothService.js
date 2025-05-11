import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { BleManager as BleManagerRNBLE } from 'react-native-ble-plx';
import { BLUETOOTH_SERVICES } from '../utils/constants';

// Use different BLE implementations based on the platform
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Create a BleManagerRNBLE instance for more advanced functionality
const bleManagerRNBLE = new BleManagerRNBLE();

/**
 * Service for managing Bluetooth Low Energy (BLE) connections
 */
class BluetoothServiceClass {
  constructor() {
    this.isInitialized = false;
    this.listeners = [];
    this.connectedDevices = {};
    this.scanTimeout = null;
    this.stateChangeCallback = null;
    this.discoveryCallback = null;
  }

  /**
   * Initialize the Bluetooth service
   */
  async init() {
    try {
      if (this.isInitialized) return true;
      
      // Initialize BleManager
      await BleManager.start({ showAlert: false });
      
      // Add listeners for events
      this.addManagerListeners();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Bluetooth service:', error);
      throw error;
    }
  }

  /**
   * Add event listeners for BleManager
   */
  addManagerListeners() {
    // Listener for BLE state changes
    this.listeners.push(
      bleManagerEmitter.addListener('BleManagerDidUpdateState', (args) => {
        if (this.stateChangeCallback) {
          this.stateChangeCallback(args.state);
        }
      })
    );

    // Listener for device discovery
    this.listeners.push(
      bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (device) => {
        // Only emit devices with a name
        if (device.name && this.discoveryCallback) {
          const formattedDevice = {
            id: device.id,
            name: device.name || 'Unknown Device',
            rssi: device.rssi,
            manufacturer: device.advertising?.manufacturerData?.bytes || [],
            serviceUUIDs: device.advertising?.serviceUUIDs || [],
          };
          this.discoveryCallback(formattedDevice);
        }
      })
    );

    // Listener for device connections
    this.listeners.push(
      bleManagerEmitter.addListener('BleManagerConnectPeripheral', (args) => {
        console.log('Device connected:', args.peripheral);
      })
    );

    // Listener for device disconnections
    this.listeners.push(
      bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', (args) => {
        console.log('Device disconnected:', args.peripheral);
        delete this.connectedDevices[args.peripheral];
      })
    );
  }

  /**
   * Remove all event listeners
   */
  removeListeners() {
    this.listeners.forEach(listener => listener.remove());
    this.listeners = [];
  }

  /**
   * Check if Bluetooth is supported on the device
   */
  isSupported() {
    return Platform.OS === 'android' || Platform.OS === 'ios';
  }

  /**
   * Get the current Bluetooth state
   */
  async getState() {
    try {
      const state = await BleManager.checkState();
      return state;
    } catch (error) {
      console.error('Error getting Bluetooth state:', error);
      return 'Unknown';
    }
  }

  /**
   * Register a callback for Bluetooth state changes
   */
  onStateChange(callback) {
    this.stateChangeCallback = callback;
  }

  /**
   * Start scanning for Bluetooth devices
   */
  async startScan(discoveryCallback) {
    try {
      this.discoveryCallback = discoveryCallback;
      
      // Stop any ongoing scans
      await this.stopScan();
      
      // Define services to scan for - common audio services
      const serviceUUIDs = Object.values(BLUETOOTH_SERVICES);
      
      // Start scanning
      await BleManager.scan(serviceUUIDs, 10, true);
      
      // Set timeout to stop scanning after 10 seconds
      this.scanTimeout = setTimeout(() => {
        this.stopScan();
      }, 10000);
      
      return true;
    } catch (error) {
      console.error('Error starting scan:', error);
      throw error;
    }
  }

  /**
   * Stop scanning for Bluetooth devices
   */
  async stopScan() {
    try {
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }
      
      await BleManager.stopScan();
      return true;
    } catch (error) {
      console.error('Error stopping scan:', error);
      return false;
    }
  }

  /**
   * Connect to a Bluetooth device
   */
  async connect(deviceId, maxRetries = 3) {
    try {
      let retryCount = 0;
      let connected = false;
      
      while (!connected && retryCount < maxRetries) {
        try {
          // Connect to the device
          await BleManager.connect(deviceId);
          
          // Retrieve services and characteristics
          await BleManager.retrieveServices(deviceId);
          
          // Store connected device
          this.connectedDevices[deviceId] = {
            id: deviceId,
            connected: true,
          };
          
          connected = true;
          
          // Also try to connect using the RNBLE library for advanced functionality
          try {
            await bleManagerRNBLE.connectToDevice(deviceId);
          } catch (rnbleError) {
            console.warn('RNBLE connection failed, using BleManager only:', rnbleError);
          }
          
          return true;
        } catch (error) {
          console.warn(`Connection attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Wait before trying again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  /**
   * Disconnect from a Bluetooth device
   */
  async disconnect(deviceId) {
    try {
      await BleManager.disconnect(deviceId);
      delete this.connectedDevices[deviceId];
      
      // Also disconnect using the RNBLE library
      try {
        const device = await bleManagerRNBLE.devices([deviceId]);
        if (device && device.length > 0) {
          await device[0].cancelConnection();
        }
      } catch (rnbleError) {
        console.warn('RNBLE disconnect failed:', rnbleError);
      }
      
      return true;
    } catch (error) {
      console.error('Error disconnecting from device:', error);
      throw error;
    }
  }

  /**
   * Check if a device is connected
   */
  isDeviceConnected(deviceId) {
    return this.connectedDevices[deviceId]?.connected || false;
  }

  /**
   * Get all connected devices
   */
  getConnectedDevices() {
    return Object.values(this.connectedDevices);
  }

  /**
   * Clean up the Bluetooth service
   */
  cleanup() {
    this.removeListeners();
    Object.keys(this.connectedDevices).forEach(deviceId => {
      this.disconnect(deviceId).catch(console.error);
    });
    this.isInitialized = false;
  }
}

export const BluetoothService = new BluetoothServiceClass();
