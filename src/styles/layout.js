/**
 * Layout Styles
 * 
 * Defines consistent spacing, sizing, and layout values throughout the application.
 * Using a standardized layout system helps maintain visual consistency.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { Dimensions, Platform, StatusBar } from 'react-native';
import { colors } from './colors';

// Get device dimensions
const { width, height } = Dimensions.get('window');

/**
 * Common spacing units
 * Following an 8-point grid system
 */
export const spacing = {
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
export const screen = {
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
export const borders = {
  thin: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  medium: {
    borderWidth: 2,
    borderColor: colors.border,
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
export const shadows = {
  // Subtle shadow
  small: Platform.select({
    ios: {
      shadowColor: colors.black,
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
      shadowColor: colors.black,
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
      shadowColor: colors.black,
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
export const sizes = {
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
 * Flex helper styles
 */
export const flex = {
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
};

export default {
  spacing,
  screen,
  borders,
  shadows,
  sizes,
  flex,
};
