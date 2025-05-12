/**
 * Styles Index
 * 
 * This file exports all styling utilities from a single location,
 * making it easier to import them throughout the application.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { colors, darkColors, withOpacity } from './colors';
import { typography, fontWeight } from './typography';
import layout from './layout';

// Re-export everything from a central location
export {
  colors,
  darkColors,
  withOpacity,
  typography,
  fontWeight,
  layout,
};

/**
 * Common styles that are used across multiple components
 */
export const commonStyles = {
  // Full size container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Centered content
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Screen container with padding
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: layout.spacing.medium,
  },
  
  // Card style
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: layout.spacing.medium,
    marginVertical: layout.spacing.small,
    ...layout.shadows.small,
  },
  
  // Section style
  section: {
    marginBottom: layout.spacing.large,
  },
  
  // Row layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Horizontal spacer
  spacer: {
    width: layout.spacing.medium,
  },
  
  // Vertical spacer
  verticalSpacer: {
    height: layout.spacing.medium,
  },
  
  // Button styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.sizes.buttonHeight.medium,
  },
  
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: layout.spacing.medium,
    minHeight: layout.sizes.inputHeight.medium,
    color: colors.textPrimary,
    ...typography.body,
  },
  
  // Divider line
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: layout.spacing.medium,
  },
};

export default {
  colors,
  darkColors,
  typography,
  fontWeight,
  layout,
  commonStyles,
};
