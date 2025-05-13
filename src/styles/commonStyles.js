/**
 * Common Styles
 * 
 * Reusable style objects for common UI patterns.
 * These styles can be imported and used across components.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { StyleSheet } from 'react-native';
import theme from './theme';

const { colors, typography, spacing, shadows } = theme;

/**
 * Common styles for layout, containers, and UI elements
 */
export const commonStyles = StyleSheet.create({
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.medium,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Card styles
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  cardTitle: {
    ...typography.h5,
  },
  cardContent: {
    marginVertical: spacing.small,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.small,
  },
  
  // Button styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonOutlineText: {
    ...typography.button,
    color: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabledText: {
    ...typography.button,
    color: colors.textDisabled,
  },
  
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.medium,
    backgroundColor: colors.backgroundLight,
    color: colors.textPrimary,
    ...typography.body,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  inputError: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  // List styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundLight,
  },
  listItemTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  listItemSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: theme.sizes.headerHeight,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.medium,
    ...shadows.medium,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.white,
  },
  
  // Icon button styles
  iconButton: {
    padding: spacing.xs,
    borderRadius: 8,
  },
  
  // Status indicator styles
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  statusSuccess: {
    backgroundColor: colors.success,
  },
  statusWarning: {
    backgroundColor: colors.warning,
  },
  statusError: {
    backgroundColor: colors.error,
  },
  statusInfo: {
    backgroundColor: colors.info,
  },
  
  // Message styles
  message: {
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
    ...shadows.small,
  },
  messageSuccess: {
    backgroundColor: theme.withOpacity(colors.success, 0.1),
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  messageWarning: {
    backgroundColor: theme.withOpacity(colors.warning, 0.1),
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  messageError: {
    backgroundColor: theme.withOpacity(colors.error, 0.1),
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  messageInfo: {
    backgroundColor: theme.withOpacity(colors.info, 0.1),
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  
  // Empty state styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateIcon: {
    marginBottom: spacing.medium,
    opacity: 0.5,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Loading indicator styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.withOpacity(colors.background, 0.8),
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.medium,
  },
});

export default commonStyles;
