/**
 * Environment Configuration
 * 
 * Centralizes environment variables and configuration settings.
 * This allows for easier management of different environments
 * (development, staging, production).
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { Platform } from 'react-native';

// Import environment variables from .env file if using react-native-dotenv
// This is a fallback mechanism if the variables aren't available
const getEnvVariable = (key, defaultValue) => {
  try {
    // Try to get from process.env (when using react-native-dotenv)
    const value = process.env[key];
    if (value !== undefined) return value;
    
    // Fallback to default
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Environment configuration object
 */
export const ENV = {
  // App information
  APP_NAME: 'AIR-assist',
  APP_VERSION: '1.0.0',
  
  // Server endpoints
  WEBSOCKET_URL: getEnvVariable('WEBSOCKET_URL', 'wss://airassist-server.example.com/ws'),
  API_URL: getEnvVariable('API_URL', 'https://airassist-server.example.com/api'),
  
  // Feature flags
  DEBUG_MODE: __DEV__,
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: !__DEV__,
  
  // Development settings
  METRO_PORT: getEnvVariable('METRO_PORT', '8081'),
  
  // Platform-specific settings
  PLATFORM: Platform.OS,
  IS_ANDROID: Platform.OS === 'android',
  IS_IOS: Platform.OS === 'ios',
};

export default ENV;
