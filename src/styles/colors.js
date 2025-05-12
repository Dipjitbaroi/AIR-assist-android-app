/**
 * Application Color Palette
 * 
 * This file defines the color scheme for the entire application.
 * Using this central palette ensures consistency across the app.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

/**
 * Base color palette
 * These are the raw color values that form the basis of our theme
 */
const palette = {
  // Primary brand colors
  navy: '#1A2E4C',
  blue: '#0056B3',
  lightBlue: '#4D9FFF',
  teal: '#00829B',
  
  // Grayscale
  black: '#000000',
  darkGray: '#222222',
  gray: '#666666',
  lightGray: '#BBBBBB',
  veryLightGray: '#EEEEEE',
  white: '#FFFFFF',
  
  // Semantic colors
  red: '#D32F2F',
  green: '#388E3C',
  yellow: '#F9A825',
  orange: '#F57C00',
  
  // Transparent colors
  transparent: 'transparent',
  semiTransparent: 'rgba(0, 0, 0, 0.5)',
  lightTransparent: 'rgba(255, 255, 255, 0.2)',
};

/**
 * Semantic color mapping
 * Maps generic UI elements to specific colors from our palette
 */
export const colors = {
  // Core UI colors
  primary: palette.blue,
  primaryDark: palette.navy,
  primaryLight: palette.lightBlue,
  secondary: palette.teal,
  accent: palette.teal,
  
  // Text colors
  textPrimary: palette.darkGray,
  textSecondary: palette.gray,
  textLight: palette.white,
  textDisabled: palette.lightGray,
  
  // Background colors
  background: palette.white,
  backgroundDark: palette.veryLightGray,
  backgroundLight: palette.white,
  
  // Status colors
  success: palette.green,
  warning: palette.yellow,
  error: palette.red,
  info: palette.blue,
  
  // Element colors
  border: palette.lightGray,
  divider: palette.veryLightGray,
  shadow: palette.semiTransparent,
  highlight: palette.lightTransparent,
  
  // Direct access to base palette
  ...palette
};

/**
 * Dark mode color mapping
 * These colors would be used when the app is in dark mode
 * (Currently not implemented but prepared for future use)
 */
export const darkColors = {
  // Core UI colors
  primary: palette.lightBlue,
  primaryDark: palette.blue,
  primaryLight: '#6FB7FF',
  secondary: palette.teal,
  accent: '#00B2C5',
  
  // Text colors
  textPrimary: palette.white,
  textSecondary: palette.lightGray,
  textLight: palette.white,
  textDisabled: palette.gray,
  
  // Background colors
  background: palette.black,
  backgroundDark: palette.black,
  backgroundLight: palette.darkGray,
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  info: '#2196F3',
  
  // Element colors
  border: palette.gray,
  divider: palette.darkGray,
  shadow: palette.semiTransparent,
  highlight: palette.lightTransparent,
  
  // Base palette remains the same
  ...palette
};

/**
 * Utility function to get color with opacity
 * 
 * @param {string} hexColor - The hex color code
 * @param {number} opacity - The opacity value (0-1)
 * @returns {string} RGBA color string
 */
export const withOpacity = (hexColor, opacity) => {
  // Convert hex to rgb
  let r = 0, g = 0, b = 0;
  
  // Handle different formats
  if (hexColor.length === 4) {
    // 3 digits (#RGB)
    r = parseInt(hexColor[1] + hexColor[1], 16);
    g = parseInt(hexColor[2] + hexColor[2], 16);
    b = parseInt(hexColor[3] + hexColor[3], 16);
  } else if (hexColor.length === 7) {
    // 6 digits (#RRGGBB)
    r = parseInt(hexColor.substring(1, 3), 16);
    g = parseInt(hexColor.substring(3, 5), 16);
    b = parseInt(hexColor.substring(5, 7), 16);
  }
  
  // Return rgba
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
