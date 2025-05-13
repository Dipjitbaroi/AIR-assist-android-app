/**
 * Card Component
 * 
 * A container component that displays content in a card format with
 * optional header, footer, and various styling options.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import theme from '../../styles/theme';

const { colors, typography, spacing, shadows } = theme;

/**
 * Card Component
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.title] - Card title
 * @param {React.ReactNode} [props.headerRight] - Component to display on the right side of the header
 * @param {React.ReactNode} [props.footer] - Footer content
 * @param {string} [props.variant='default'] - Card style variant (default, outlined, elevated)
 * @param {boolean} [props.onPress] - Function to call when card is pressed (makes card pressable)
 * @param {Object} [props.style] - Additional style for the card container
 * @param {Object} [props.contentStyle] - Additional style for the content area
 * @returns {React.ReactElement} Rendered component
 */
const Card = ({
  children,
  title,
  headerRight,
  footer,
  variant = 'default',
  onPress,
  style,
  contentStyle,
  ...rest
}) => {
  /**
   * Get container style based on variant
   * 
   * @returns {Array} Array of style objects
   */
  const getContainerStyle = () => {
    const containerStyles = [styles.container, styles[`${variant}Container`]];
    
    if (style) {
      containerStyles.push(style);
    }
    
    return containerStyles;
  };
  
  /**
   * Render card header if title or headerRight is provided
   * 
   * @returns {React.ReactElement|null} Header component or null
   */
  const renderHeader = () => {
    if (!title && !headerRight) return null;
    
    return (
      <View style={styles.header}>
        {title && <Text style={styles.title}>{title}</Text>}
        {headerRight && <View>{headerRight}</View>}
      </View>
    );
  };
  
  /**
   * Render card footer if provided
   * 
   * @returns {React.ReactElement|null} Footer component or null
   */
  const renderFooter = () => {
    if (!footer) return null;
    
    return (
      <View style={styles.footer}>
        {footer}
      </View>
    );
  };
  
  /**
   * Render card content
   * 
   * @returns {React.ReactElement} Content component
   */
  const renderContent = () => {
    return (
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    );
  };
  
  // If card is pressable, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        style={getContainerStyle()}
        onPress={onPress}
        activeOpacity={0.7}
        {...rest}
      >
        {renderHeader()}
        {renderContent()}
        {renderFooter()}
      </TouchableOpacity>
    );
  }
  
  // Otherwise, use a regular View
  return (
    <View style={getContainerStyle()} {...rest}>
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.medium,
  },
  
  // Variant styles
  defaultContainer: {
    backgroundColor: colors.backgroundLight,
    ...shadows.small,
  },
  outlinedContainer: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevatedContainer: {
    backgroundColor: colors.backgroundLight,
    ...shadows.medium,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  
  // Content styles
  content: {
    padding: spacing.medium,
  },
  
  // Footer styles
  footer: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default Card;
