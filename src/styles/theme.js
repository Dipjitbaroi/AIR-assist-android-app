/**
 * Application Theme
 * 
 * Centralizes all styling-related constants and utilities.
 * This provides a consistent design system across the app.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { Dimensions, Platform, StatusBar } from 'react-native';

// Get device dimensions
const { width, height } = Dimensions.get('window');

/**
 * Base color palette
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
 * Font family definitions based on platform
 */
const fontFamily = {
  // Primary font
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),
  
  // Medium weight font
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'sans-serif-medium',
  }),
  
  // Bold font
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'sans-serif-bold',
  }),
  
  // Light font
  light: Platform.select({
    ios: 'System',
    android: 'Roboto-Light',
    default: 'sans-serif-light',
  }),
  
  // Monospace font (for code, etc.)
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

/**
 * Font size definitions (in units)
 */
const fontSize = {
  tiny: 10,
  small: 12,
  body: 14,
  medium: 16,
  large: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  huge: 36,
};

/**
 * Line height multipliers
 */
const lineHeightMultiplier = {
  tight: 1.15,
  normal: 1.35,
  loose: 1.5,
};

/**
 * Common spacing units (8-point grid system)
 */
const spacing = {
  tiny: 2,
  xxs: 4,
  xs: 8,
  small: 12,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

/**
 * Screen dimensions and breakpoints
 */
const screen = {
  width,
  height,
  
  // Breakpoints for responsive design
  breakpoints: {
    small: 360,
    medium: 480,
    large: 600,
    xlarge: 720,
  },
  
  // Determine if the current device is considered small
  isSmall: width < 360,
  
  // Helper function to determine if screen is larger than breakpoint
  isLargerThan: (breakpoint) => width >= breakpoint,
};

/**
 * Common border styles
 */
const borders = {
  thin: {
    borderWidth: 1,
    borderColor: 'colors.border',
  },
  medium: {
    borderWidth: 2,
    borderColor: 'colors.border',
  },
  rounded: {
    borderRadius: 8,
  },
  circle: {
    borderRadius: 999,
  },
};

/**
 * Common shadow styles
 */
const shadows = {
  // Subtle shadow
  small: Platform.select({
    ios: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  
  // Medium shadow
  medium: Platform.select({
    ios: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  
  // Prominent shadow
  large: Platform.select({
    ios: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
};

/**
 * Common components sizing
 */
const sizes = {
  // Button sizes
  buttonHeight: {
    small: 32,
    medium: 44,
    large: 56,
  },
  
  // Input field sizes
  inputHeight: {
    small: 36,
    medium: 48,
    large: 56,
  },
  
  // Icon sizes
  iconSize: {
    small: 16,
    medium: 24,
    large: 32,
    xl: 48,
  },
  
  // Avatar sizes
  avatarSize: {
    small: 32,
    medium: 48,
    large: 64,
    xl: 96,
  },
  
  // Header heights
  headerHeight: 56,
  
  // Tab bar height
  tabBarHeight: 56,
  
  // Status bar height (platform specific)
  statusBarHeight: Platform.OS === 'ios' 
    ? 20 
    : StatusBar.currentHeight || 24,
};

/**
 * Light theme colors
 */
const lightColors = {
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
 * Dark theme colors
 */
const darkColors = {
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
 * Typography styles
 */
const createTypography = (colors) => ({
  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.huge,
    lineHeight: fontSize.huge * lineHeightMultiplier.tight,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    lineHeight: fontSize.xxxl * lineHeightMultiplier.tight,
    color: colors.textPrimary,
    letterSpacing: -0.25,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * lineHeightMultiplier.tight,
    color: colors.textPrimary,
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeightMultiplier.normal,
    color: colors.textPrimary,
  },
  h5: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.large,
    lineHeight: fontSize.large * lineHeightMultiplier.normal,
    color: colors.textPrimary,
  },
  
  // Body text styles
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.large,
    lineHeight: fontSize.large * lineHeightMultiplier.normal,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.medium,
    lineHeight: fontSize.medium * lineHeightMultiplier.normal,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeightMultiplier.normal,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.small,
    lineHeight: fontSize.small * lineHeightMultiplier.normal,
    color: colors.textPrimary,
  },
  
  // Specialized text styles
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.small,
    lineHeight: fontSize.small * lineHeightMultiplier.normal,
    color: colors.textSecondary,
  },
  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.medium,
    lineHeight: fontSize.medium * lineHeightMultiplier.tight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textLight,
  },
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeightMultiplier.loose,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeightMultiplier.tight,
    color: colors.textSecondary,
  },
  
  // Font weight helpers
  light: {
    fontFamily: fontFamily.light,
  },
  regular: {
    fontFamily: fontFamily.regular,
  },
  medium: {
    fontFamily: fontFamily.medium,
  },
  bold: {
    fontFamily: fontFamily.bold,
  },
});

/**
 * Utility function to get color with opacity
 * 
 * @param {string} hexColor - The hex color code
 * @param {number} opacity - The opacity value (0-1)
 * @returns {string} RGBA color string
 */
const withOpacity = (hexColor, opacity) => {
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

/**
 * Create a theme object with all styling properties
 * 
 * @param {string} mode - Theme mode ('light' or 'dark')
 * @returns {Object} Complete theme object
 */
export const createTheme = (mode = 'light') => {
  const colors = mode === 'dark' ? darkColors : lightColors;
  
  return {
    mode,
    colors,
    typography: createTypography(colors),
    spacing,
    screen,
    borders,
    shadows,
    sizes,
    withOpacity: (color, opacity) => withOpacity(color, opacity),
  };
};

// Default theme is light mode
const theme = createTheme('light');

export default theme;
