/**
 * Storage Utility
 * 
 * Centralizes storage operations for the application.
 * Provides functions for saving, loading, and removing data from AsyncStorage.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Save data to AsyncStorage
 * 
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 * @returns {Promise<boolean>} Whether save was successful
 */
export const saveData = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    return false;
  }
};

/**
 * Load data from AsyncStorage
 * 
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<any>} Loaded data or default value
 */
export const loadData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove data from AsyncStorage
 * 
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Whether removal was successful
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all app data from AsyncStorage
 * 
 * @returns {Promise<boolean>} Whether clear was successful
 */
export const clearAllData = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Save settings to AsyncStorage
 * 
 * @param {Object} settings - Settings object
 * @returns {Promise<boolean>} Whether save was successful
 */
export const saveSettings = async (settings) => {
  return saveData(STORAGE_KEYS.SETTINGS, settings);
};

/**
 * Load settings from AsyncStorage
 * 
 * @param {Object} defaultSettings - Default settings if none exist
 * @returns {Promise<Object>} Loaded settings or default settings
 */
export const loadSettings = async (defaultSettings) => {
  return loadData(STORAGE_KEYS.SETTINGS, defaultSettings);
};

/**
 * Save conversation history to AsyncStorage
 * 
 * @param {Array} messages - Array of message objects
 * @param {number} maxMessages - Maximum number of messages to keep
 * @returns {Promise<boolean>} Whether save was successful
 */
export const saveConversationHistory = async (messages, maxMessages = 100) => {
  // Only keep the last maxMessages messages to prevent storage overflow
  const messagesToSave = messages.slice(-maxMessages);
  return saveData(STORAGE_KEYS.CONVERSATION_HISTORY, messagesToSave);
};

/**
 * Load conversation history from AsyncStorage
 * 
 * @returns {Promise<Array>} Array of message objects or empty array
 */
export const loadConversationHistory = async () => {
  return loadData(STORAGE_KEYS.CONVERSATION_HISTORY, []);
};

/**
 * Clear conversation history
 * 
 * @returns {Promise<boolean>} Whether clear was successful
 */
export const clearConversationHistory = async () => {
  return removeData(STORAGE_KEYS.CONVERSATION_HISTORY);
};

/**
 * Save pending messages to AsyncStorage
 * 
 * @param {Array} messages - Array of pending message objects
 * @returns {Promise<boolean>} Whether save was successful
 */
export const savePendingMessages = async (messages) => {
  return saveData(STORAGE_KEYS.PENDING_MESSAGES, messages);
};

/**
 * Load pending messages from AsyncStorage
 * 
 * @returns {Promise<Array>} Array of pending message objects or empty array
 */
export const loadPendingMessages = async () => {
  return loadData(STORAGE_KEYS.PENDING_MESSAGES, []);
};

/**
 * Save Bluetooth devices to AsyncStorage
 * 
 * @param {Array} devices - Array of device objects
 * @returns {Promise<boolean>} Whether save was successful
 */
export const saveBluetoothDevices = async (devices) => {
  return saveData(STORAGE_KEYS.BLUETOOTH_DEVICES, devices);
};

/**
 * Load Bluetooth devices from AsyncStorage
 * 
 * @returns {Promise<Array>} Array of device objects or empty array
 */
export const loadBluetoothDevices = async () => {
  return loadData(STORAGE_KEYS.BLUETOOTH_DEVICES, []);
};

/**
 * Generate or load user ID
 * 
 * @returns {Promise<string>} User ID
 */
export const getUserId = async () => {
  let userId = await loadData(STORAGE_KEYS.USER_ID);
  
  if (!userId) {
    // Generate a new user ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await saveData(STORAGE_KEYS.USER_ID, userId);
  }
  
  return userId;
};

export default {
  saveData,
  loadData,
  removeData,
  clearAllData,
  saveSettings,
  loadSettings,
  saveConversationHistory,
  loadConversationHistory,
  clearConversationHistory,
  savePendingMessages,
  loadPendingMessages,
  saveBluetoothDevices,
  loadBluetoothDevices,
  getUserId,
};
