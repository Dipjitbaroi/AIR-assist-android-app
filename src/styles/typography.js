/**
 * Typography Styles
 * 
 * Defines consistent text styles throughout the application.
 * Using a centralized typography system ensures consistency and
 * makes it easier to adjust the visual design across the app.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { Platform } from 'react-native';
import { colors } from './colors';

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
 * Following a type scale for consistency
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
 * These provide consistent line heights relative to font size
 */
const lineHeightMultiplier = {
  tight: 1.15,
  normal: 1.35,
  loose: 1.5,
};

/**
 * Typography styles to use throughout the app
 * These combinations of font attributes can be imported
 * and used directly in component styles
 */
export const typography = {
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
};

/**
 * Font weight values (use with the fontWeight property)
 */
export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  bold: '700',
};

export default typography;
