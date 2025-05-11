import { Platform } from 'react-native';
import { WS_MESSAGE_TYPES } from './constants';

/**
 * Format a date to a readable string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a time to a readable string
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Create a WebSocket message
 */
export const createMessage = (type, data) => {
  return JSON.stringify({
    type,
    ...data,
    timestamp: Date.now(),
  });
};

/**
 * Parse a WebSocket message
 */
export const parseMessage = (message) => {
  try {
    return JSON.parse(message);
  } catch (error) {
    console.error('Error parsing message:', error);
    return null;
  }
};

/**
 * Check if a value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Get platform-specific styles
 */
export const getPlatformStyles = (androidStyles, iosStyles) => {
  return Platform.OS === 'ios' ? iosStyles : androidStyles;
};
