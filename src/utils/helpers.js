/**
 * Helper Functions
 * 
 * Utility functions used throughout the application.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { Platform, Dimensions, PixelRatio } from 'react-native';

/**
 * Get a value based on the platform
 * 
 * @param {Object} options - Platform-specific values
 * @param {any} options.ios - Value for iOS
 * @param {any} options.android - Value for Android
 * @param {any} options.default - Default value
 * @returns {any} Platform-specific value
 */
export const getPlatformValue = ({ ios, android, default: defaultValue }) => {
  if (Platform.OS === 'ios') return ios;
  if (Platform.OS === 'android') return android;
  return defaultValue;
};

/**
 * Check if the device is an iPhone with a notch
 * 
 * @returns {boolean} Whether the device is an iPhone with a notch
 */
export const isIphoneWithNotch = () => {
  const { height, width } = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (height === 812 || width === 812 || height === 896 || width === 896)
  );
};

/**
 * Format a date to a readable string
 * 
 * @param {Date|number} date - Date object or timestamp
 * @param {Object} options - Formatting options
 * @param {boolean} [options.includeTime=true] - Whether to include time
 * @param {boolean} [options.includeSeconds=false] - Whether to include seconds
 * @param {boolean} [options.use24Hour=false] - Whether to use 24-hour format
 * @returns {string} Formatted date string
 */
export const formatDate = (date, { includeTime = true, includeSeconds = false, use24Hour = false } = {}) => {
  const d = date instanceof Date ? date : new Date(date);
  
  // Format date part
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const datePart = `${day}/${month}/${year}`;
  
  // Return date only if time is not included
  if (!includeTime) {
    return datePart;
  }
  
  // Format time part
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  let timePart;
  if (use24Hour) {
    // 24-hour format
    hours = hours.toString().padStart(2, '0');
    timePart = includeSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  } else {
    // 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    timePart = includeSeconds
      ? `${hours}:${minutes}:${seconds} ${period}`
      : `${hours}:${minutes} ${period}`;
  }
  
  return `${datePart} ${timePart}`;
};

/**
 * Format a timestamp relative to now
 * 
 * @param {Date|number} date - Date object or timestamp
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(date, { includeTime: false });
  }
};

/**
 * Truncate a string to a maximum length
 * 
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} [suffix='...'] - Suffix to add when truncated
 * @returns {string} Truncated string
 */
export const truncateString = (str, maxLength, suffix = '...') => {
  if (!str || str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Debounce a function
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle a function
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Generate a random ID
 * 
 * @param {number} [length=8] - ID length
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 2 + length);
  return `${timestamp}-${randomStr}`;
};

/**
 * Convert pixels to density-independent pixels
 * 
 * @param {number} px - Pixel value
 * @returns {number} Density-independent pixel value
 */
export const pxToDp = (px) => {
  const screenWidth = Dimensions.get('window').width;
  const scale = screenWidth / 375; // Based on iPhone 8 width
  
  return PixelRatio.roundToNearestPixel(px * scale);
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object)
 * 
 * @param {any} value - Value to check
 * @returns {boolean} Whether the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  
  return false;
};

/**
 * Format a file size in bytes to a human-readable string
 * 
 * @param {number} bytes - File size in bytes
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Convert a base64 string to a Blob
 * 
 * @param {string} base64 - Base64 string
 * @param {string} [mimeType='application/octet-stream'] - MIME type
 * @returns {Blob} Blob object
 */
export const base64ToBlob = (base64, mimeType = 'application/octet-stream') => {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
};

export default {
  getPlatformValue,
  isIphoneWithNotch,
  formatDate,
  formatRelativeTime,
  truncateString,
  debounce,
  throttle,
  generateId,
  pxToDp,
  isEmpty,
  formatFileSize,
  base64ToBlob,
};
