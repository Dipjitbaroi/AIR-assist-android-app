// Default settings
export const DEFAULT_SETTINGS = {
  userName: 'Guest User',
  userId: '',
  autoListen: true,
  silenceThreshold: 15,
  wsServerUrl: 'wss://your-websocket-server.com',
  aiVoice: 'default',
};

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'airassist_settings',
  PENDING_MESSAGES: 'airassist_pending_messages',
  CONVERSATION_HISTORY: 'airassist_conversation_history',
  BLUETOOTH_DEVICES: 'airassist_bluetooth_devices',
  USER_INFO: 'airassist_user_info',
};

// Bluetooth services UUIDs
export const BLUETOOTH_SERVICES = {
  A2DP_SINK: '0000110b-0000-1000-8000-00805f9b34fb',
  A2DP_SOURCE: '0000110a-0000-1000-8000-00805f9b34fb',
  HSP_HFP: '00001108-0000-1000-8000-00805f9b34fb',
  HANDS_FREE_VOICE_GATEWAY: '00001131-0000-1000-8000-00805f9b34fb',
  HANDS_FREE: '0000111e-0000-1000-8000-00805f9b34fb',
  ADVANCED_AUDIO_DISTRIBUTION: '00001132-0000-1000-8000-00805f9b34fb',
  GENERIC_ACCESS: '00001800-0000-1000-8000-00805f9b34fb',
  GENERIC_ATTRIBUTE: '00001801-0000-1000-8000-00805f9b34fb',
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  AUDIO: 'audioMessage',
  TEXT: 'textMessage',
  RESPONSE: 'aiResponse',
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error',
};

// App version
export const APP_VERSION = '1.0.0';

// Maximum recording duration in milliseconds
export const MAX_RECORDING_DURATION = 30000; // 30 seconds

// Silence detection settings
export const SILENCE_DETECTION = {
  MIN_THRESHOLD: 5,
  MAX_THRESHOLD: 30,
  DEFAULT_THRESHOLD: 15,
  SILENCE_DURATION: 1500, // 1.5 seconds of silence to stop recording
};

// Audio recording settings
export const AUDIO_SETTINGS = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  BIT_DEPTH: 16,
  FORMAT: 'wav',
};

// Permission request codes
export const PERMISSION_CODES = {
  BLUETOOTH: 100,
  AUDIO: 101,
  STORAGE: 102,
};
