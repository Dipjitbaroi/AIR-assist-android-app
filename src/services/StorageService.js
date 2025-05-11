import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageServiceClass {
  /**
   * Save data to storage
   */
  async saveData(key, value) {
    try {
      if (typeof value === 'object') {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } else {
        await AsyncStorage.setItem(key, String(value));
      }
      return true;
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Load data from storage
   */
  async loadData(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      
      if (value === null) {
        return defaultValue;
      }
      
      try {
        return JSON.parse(value);
      } catch (parseError) {
        // If parsing fails, return the raw value
        return value;
      }
    } catch (error) {
      console.error(`Error loading data for key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data from storage
   */
  async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app data
   */
  async clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

export const StorageService = new StorageServiceClass();
