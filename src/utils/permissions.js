/**
 * Permissions Utility
 * 
 * Centralizes permission handling for the application.
 * Provides functions for checking and requesting permissions.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PERMISSIONS as APP_PERMISSIONS } from '../config/constants';

/**
 * Check if a permission is granted
 * 
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} Whether permission is granted
 */
export const checkPermission = async (permission) => {
  try {
    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error(`Error checking permission ${permission}:`, error);
    return false;
  }
};

/**
 * Request a permission
 * 
 * @param {string} permission - Permission to request
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestPermission = async (permission) => {
  try {
    const result = await request(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error(`Error requesting permission ${permission}:`, error);
    return false;
  }
};

/**
 * Check if Bluetooth permissions are granted
 * 
 * @returns {Promise<boolean>} Whether all Bluetooth permissions are granted
 */
export const hasBluetoothPermissions = async () => {
  const permissions = Platform.select({
    android: APP_PERMISSIONS.ANDROID.BLUETOOTH,
    ios: APP_PERMISSIONS.IOS.BLUETOOTH,
    default: [],
  });
  
  // Check each permission
  const results = await Promise.all(
    permissions.map(permission => checkPermission(permission))
  );
  
  // All permissions must be granted
  return results.every(result => result === true);
};

/**
 * Request Bluetooth permissions
 * 
 * @returns {Promise<boolean>} Whether all Bluetooth permissions were granted
 */
export const requestBluetoothPermissions = async () => {
  const permissions = Platform.select({
    android: APP_PERMISSIONS.ANDROID.BLUETOOTH,
    ios: APP_PERMISSIONS.IOS.BLUETOOTH,
    default: [],
  });
  
  // Request each permission
  const results = await Promise.all(
    permissions.map(permission => requestPermission(permission))
  );
  
  // All permissions must be granted
  return results.every(result => result === true);
};

/**
 * Check if microphone permission is granted
 * 
 * @returns {Promise<boolean>} Whether microphone permission is granted
 */
export const hasMicrophonePermission = async () => {
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    ios: PERMISSIONS.IOS.MICROPHONE,
    default: null,
  });
  
  if (!permission) {
    return false;
  }
  
  return checkPermission(permission);
};

/**
 * Request microphone permission
 * 
 * @returns {Promise<boolean>} Whether microphone permission was granted
 */
export const requestMicrophonePermission = async () => {
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    ios: PERMISSIONS.IOS.MICROPHONE,
    default: null,
  });
  
  if (!permission) {
    return false;
  }
  
  return requestPermission(permission);
};

/**
 * Check if storage permissions are granted
 * 
 * @returns {Promise<boolean>} Whether all storage permissions are granted
 */
export const hasStoragePermissions = async () => {
  // Storage permissions are only needed on Android
  if (Platform.OS !== 'android') {
    return true;
  }
  
  const permissions = APP_PERMISSIONS.ANDROID.STORAGE;
  
  // Check each permission
  const results = await Promise.all(
    permissions.map(permission => checkPermission(permission))
  );
  
  // All permissions must be granted
  return results.every(result => result === true);
};

/**
 * Request storage permissions
 * 
 * @returns {Promise<boolean>} Whether all storage permissions were granted
 */
export const requestStoragePermissions = async () => {
  // Storage permissions are only needed on Android
  if (Platform.OS !== 'android') {
    return true;
  }
  
  const permissions = APP_PERMISSIONS.ANDROID.STORAGE;
  
  // Request each permission
  const results = await Promise.all(
    permissions.map(permission => requestPermission(permission))
  );
  
  // All permissions must be granted
  return results.every(result => result === true);
};

/**
 * Request all required permissions for the app
 * 
 * @returns {Promise<Object>} Object with permission results
 */
export const requestAllPermissions = async () => {
  const bluetooth = await requestBluetoothPermissions();
  const microphone = await requestMicrophonePermission();
  const storage = await requestStoragePermissions();
  
  return {
    bluetooth,
    microphone,
    storage,
    allGranted: bluetooth && microphone && storage,
  };
};

/**
 * Check all required permissions for the app
 * 
 * @returns {Promise<Object>} Object with permission results
 */
export const checkAllPermissions = async () => {
  const bluetooth = await hasBluetoothPermissions();
  const microphone = await hasMicrophonePermission();
  const storage = await hasStoragePermissions();
  
  return {
    bluetooth,
    microphone,
    storage,
    allGranted: bluetooth && microphone && storage,
  };
};

/**
 * Request Android permissions
 * 
 * @returns {Promise<boolean>} Whether all permissions were granted
 */
export const requestAndroidPermissions = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }
  
  const { allGranted } = await requestAllPermissions();
  return allGranted;
};

/**
 * Request iOS permissions
 * 
 * @returns {Promise<boolean>} Whether all permissions were granted
 */
export const requestIOSPermissions = async () => {
  if (Platform.OS !== 'ios') {
    return true;
  }
  
  const bluetooth = await requestBluetoothPermissions();
  const microphone = await requestMicrophonePermission();
  
  return bluetooth && microphone;
};

export default {
  checkPermission,
  requestPermission,
  hasBluetoothPermissions,
  requestBluetoothPermissions,
  hasMicrophonePermission,
  requestMicrophonePermission,
  hasStoragePermissions,
  requestStoragePermissions,
  requestAllPermissions,
  checkAllPermissions,
  requestAndroidPermissions,
  requestIOSPermissions,
};
