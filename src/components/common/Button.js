/**
 * Button Component
 * 
 * A customizable button component with different variants and states.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../styles/theme';

const { colors, typography, spacing, shadows } = theme;

/**
 * Button Component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {string} [props.variant='primary'] - Button style variant (primary, secondary, outline, text)
 * @param {string} [props.size='medium'] - Button size (small, medium, large)
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.loading=false] - Whether to show a loading indicator
 * @param {string} [props.iconName] - Name of icon to display (from MaterialIcons)
 * @param {string} [props.iconPosition='left'] - Position of icon (left or right)
 * @param {Object} [props.style] - Additional style for the button
 * @param {Object} [props.textStyle] - Additional style for the button text
 * @returns {React.ReactElement} Rendered component
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  iconName,
  iconPosition = 'left',
  style,
  textStyle,
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
   * Get text style based on variant, size, and disabled state
   * 
   * @returns {Array} Array of style objects
   */
  const getTextStyle = () => {
    const textStyles = [styles.buttonText, styles[`${variant}Text`], styles[`${size}Text`]];
    
    if (disabled) {
      textStyles.push(styles.disabledText);
    }
    
    if (textStyle) {
      textStyles.push(textStyle);
    }
    
    return textStyles;
  };
  
  /**
   * Get icon color based on variant and disabled state
   * 
   * @returns {string} Color value
   */
  const getIconColor = () => {
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
      case 'text':
        return colors.primary;
      default:
        return colors.white;
    }
  };
  
  /**
   * Render icon if provided
   * 
   * @returns {React.ReactElement|null} Icon component or null
   */
  const renderIcon = () => {
    if (!iconName) return null;
    
    return (
      <Icon
        name={iconName}
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
        color={getIconColor()}
        style={[
          styles.icon,
          iconPosition === 'right' ? styles.iconRight : styles.iconLeft,
        ]}
      />
    );
  };
  
  /**
   * Render loading indicator if loading
   * 
   * @returns {React.ReactElement|null} ActivityIndicator component or null
   */
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'small'}
        color={variant === 'outline' || variant === 'text' ? colors.primary : colors.white}
        style={styles.loader}
      />
    );
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
        renderLoading()
      ) : (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && renderIcon()}
          <Text style={getTextStyle()}>{title}</Text>
          {iconPosition === 'right' && renderIcon()}
        </View>
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
    flexDirection: 'row',
  },
  
  // Variant styles
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
    borderColor: colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  
  // Size styles
  smallButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.medium,
    minHeight: 32,
  },
  mediumButton: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.large,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  
  // State styles
  disabledButton: {
    backgroundColor: colors.backgroundDark,
    borderColor: colors.border,
    ...shadows.none,
  },
  
  // Content container
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text styles
  buttonText: {
    textAlign: 'center',
    fontFamily: typography.button.fontFamily,
    fontWeight: '500',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  textText: {
    color: colors.primary,
  },
  
  // Text size styles
  smallText: {
    fontSize: typography.small,
  },
  mediumText: {
    fontSize: typography.body,
  },
  largeText: {
    fontSize: typography.medium,
  },
  
  // Disabled text
  disabledText: {
    color: colors.textDisabled,
  },
  
  // Icon styles
  icon: {
    alignSelf: 'center',
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
  
  // Loader style
  loader: {
    marginHorizontal: spacing.small,
  },
});

export default Button;
