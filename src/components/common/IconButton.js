/**
 * IconButton Component
 * 
 * A button component that displays only an icon.
 * Useful for toolbar actions, headers, and compact UI elements.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../styles/theme';

const { colors, spacing, shadows } = theme;

/**
 * IconButton Component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.name - Icon name from MaterialIcons
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {string} [props.variant='default'] - Button style variant (default, primary, secondary, outline)
 * @param {string} [props.size='medium'] - Button size (small, medium, large)
 * @param {string} [props.color] - Custom icon color (overrides variant color)
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.loading=false] - Whether to show a loading indicator
 * @param {Object} [props.style] - Additional style for the button
 * @returns {React.ReactElement} Rendered component
 */
const IconButton = ({
  name,
  onPress,
  variant = 'default',
  size = 'medium',
  color,
  disabled = false,
  loading = false,
  style,
  ...rest
}) => {
  /**
   * Get container style based on variant, size, and disabled state
   * 
   * @returns {Array} Array of style objects
   */
  const getContainerStyle = () => {
    const containerStyles = [styles.button, styles[`${variant}Button`], styles[`${size}Button`]];
    
    if (disabled) {
      containerStyles.push(styles.disabledButton);
    }
    
    if (style) {
      containerStyles.push(style);
    }
    
    return containerStyles;
  };
  
  /**
   * Get icon size based on button size
   * 
   * @returns {number} Icon size
   */
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 28;
      case 'medium':
      default:
        return 22;
    }
  };
  
  /**
   * Get icon color based on variant and disabled state
   * 
   * @returns {string} Color value
   */
  const getIconColor = () => {
    // If custom color is provided, use it
    if (color) {
      return disabled ? colors.textDisabled : color;
    }
    
    // Otherwise, use variant-based color
    if (disabled) {
      return colors.textDisabled;
    }
    
    switch (variant) {
      case 'primary':
        return colors.white;
      case 'secondary':
        return colors.white;
      case 'outline':
        return colors.primary;
      case 'default':
      default:
        return colors.textPrimary;
    }
  };
  
  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getIconColor()}
        />
      ) : (
        <Icon
          name={name}
          size={getIconSize()}
          color={getIconColor()}
        />
      )}
    </TouchableOpacity>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Variant styles
  defaultButton: {
    backgroundColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadows.small,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    ...shadows.small,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Size styles
  smallButton: {
    padding: spacing.xs,
    minWidth: 32,
    minHeight: 32,
  },
  mediumButton: {
    padding: spacing.small,
    minWidth: 40,
    minHeight: 40,
  },
  largeButton: {
    padding: spacing.medium,
    minWidth: 48,
    minHeight: 48,
  },
  
  // State styles
  disabledButton: {
    opacity: 0.5,
  },
});

export default IconButton;
