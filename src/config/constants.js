/**
 * Application Constants
 * 
 * Centralizes all constant values used throughout the application.
 * This helps maintain consistency and makes updates easier.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { ENV } from './env';

/**
 * Storage keys for AsyncStorage
 * Using a structured object helps prevent key collisions
 */
export const STORAGE_KEYS = {
  SETTINGS: '@AIRAssist:settings',
  CONVERSATION_HISTORY: '@AIRAssist:conversation',
  PENDING_MESSAGES: '@AIRAssist:pendingMessages',
  USER_ID: '@AIRAssist:userId',
  BLUETOOTH_DEVICES: '@AIRAssist:btDevices',
};

/**
 * Default application settings
 * These values are used when the app is first installed or if settings are reset
 */
export const DEFAULT_SETTINGS = {
  // WebSocket server settings
  wsServerUrl: ENV.WEBSOCKET_URL,
  
  // User settings
  userId: null, // Will be generated on first run
  userName: 'User',
  
  // Audio settings
  aiVoice: 'default',
  micSensitivity: 75, // 0-100 scale
  silenceThreshold: 0.2, // 0.0-1.0 scale
  speakerVolume: 80, // 0-100 scale
  
  // Behavior settings
  autoListen: true,
  autoConnect: true,
  saveHistory: true,
  readResponses: true,
  
  // Customization
  theme: 'dark',
  enableVibration: true,
  responseSpeed: 1.0, // 0.5-2.0 scale
};

/**
 * WebSocket message types
 * These define the protocol for communication with the server
 */
export const WS_MESSAGE_TYPES = {
  AUDIO: 'audioMessage',
  TEXT: 'textMessage',
  AI_RESPONSE: 'aiResponse',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
};

/**
 * Bluetooth connection states
 */
export const BT_CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SCANNING: 'scanning',
  ERROR: 'error',
};

/**
 * Permissions required by the application
 */
export const PERMISSIONS = {
  ANDROID: {
    BLUETOOTH: [
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    MICROPHONE: [
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
    ],
    STORAGE: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
  },
  IOS: {
    BLUETOOTH: ['bluetooth-peripheral'],
    MICROPHONE: ['microphone'],
  },
};

/**
 * Time constants in milliseconds
 */
export const TIME = {
  WEBSOCKET_RECONNECT_INTERVAL: 5000,
  BLE_SCAN_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 300,
  LONG_PRESS_DURATION: 500,
  SILENCE_DETECTION_TIMEOUT: 2000,
  AUTO_LISTEN_DELAY: 1000,
};

/**
 * Bluetooth services UUIDs
 */
export const BLUETOOTH_SERVICES = {
  GENERIC_ACCESS: '1800',
  GENERIC_ATTRIBUTE: '1801',
  IMMEDIATE_ALERT: '1802',
  LINK_LOSS: '1803',
  TX_POWER: '1804',
  HEART_RATE: '180D',
  BATTERY_SERVICE: '180F',
  DEVICE_INFORMATION: '180A',
  AUDIO_SERVICE: '1843', // Custom audio service
};

/**
 * Message types for the conversation
 */
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
};

/**
 * App information
 */
export const APP_INFO = {
  NAME: ENV.APP_NAME,
  VERSION: ENV.APP_VERSION,
};
