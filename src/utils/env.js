/**
 * Environment Variable Utilities
 * 
 * Centralizes access to environment variables and provides default values
 * when environment variables are not defined.
 *
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { Platform } from 'react-native';
import {
  METRO_PORT,
  WEBSOCKET_URL,
  APP_NAME,
  APP_VERSION,
  DEBUG_MODE
} from '@env';

/**
 * Default environment values
 */
const defaults = {
  metroPort: '8082',
  websocketUrl: 'wss://api.airassist.io/ws',
  appName: 'AIRAssist',
  appVersion: '1.0.0',
  debugMode: __DEV__ ? 'true' : 'false',
};

/**
 * Environment configuration with fallbacks to default values
 */
export const env = {
  /**
   * Metro bundler port
   * @type {number}
   */
  metroPort: parseInt(METRO_PORT || defaults.metroPort, 10),
  
  /**
   * WebSocket server URL
   * @type {string}
   */
  websocketUrl: WEBSOCKET_URL || defaults.websocketUrl,
  
  /**
   * Application name
   * @type {string}
   */
  appName: APP_NAME || defaults.appName,
  
  /**
   * Application version
   * @type {string}
   */
  appVersion: APP_VERSION || defaults.appVersion,
  
  /**
   * Debug mode flag
   * @type {boolean}
   */
  debugMode: (DEBUG_MODE || defaults.debugMode).toLowerCase() === 'true',
  
  /**
   * Current platform (ios or android)
   * @type {string}
   */
  platform: Platform.OS,
  
  /**
   * Is the app running in development mode
   * @type {boolean}
   */
  isDevelopment: __DEV__,
};

export default env;
