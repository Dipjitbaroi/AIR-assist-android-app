/**
 * Custom Button Component
 * 
 * A reusable button component with various styles and states.
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
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { layout } from '../../styles/layout';

/**
 * Custom Button Component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.label - Button text
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {string} [props.type='primary'] - Button type (primary, secondary, outline, danger)
 * @param {string} [props.size='medium'] - Button size (small, medium, large)
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {boolean} [props.loading=false] - Whether to show loading indicator
 * @param {string} [props.icon] - Optional icon name to display
 * @param {Object} [props.style] - Additional style to apply
 * @returns {React.ReactElement} Rendered component
 */
const Button = ({
  label,
  onPress,
  type = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  /**
   * Get button container style based on props
   * 
   * @returns {Array} Array of style objects
   */
  const getButtonStyle = () => {
    const buttonStyles = [styles.button, styles[`${type}Button`], styles[`${size}Button`]];
    
    if (fullWidth) {
      buttonStyles.push(styles.fullWidth);
    }
    
    if (disabled || loading) {
      buttonStyles.push(styles.disabledButton);
    }
    
    if (style) {
      buttonStyles.push(style);
    }
    
    return buttonStyles;
  };
  
  /**
   * Get text style based on props
   * 
   * @returns {Array} Array of style objects
   */
  const getTextStyle = () => {
    const textStyles = [styles.text, styles[`${type}Text`], styles[`${size}Text`]];
    
    if (disabled || loading) {
      textStyles.push(styles.disabledText);
    }
    
    return textStyles;
  };
  
  /**
   * Render button content based on state
   * 
   * @returns {React.ReactElement} Button content
   */
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={type === 'outline' ? colors.primary : colors.white} 
        />
      );
    }
    
    return (
      <View style={styles.contentContainer}>
        {icon && (
          <Icon
            name={icon}
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
            color={type === 'outline' ? colors.primary : colors.white}
            style={styles.icon}
          />
        )}
        <Text style={getTextStyle()}>{label}</Text>
      </View>
    );
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
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
  
  // Button sizes
  smallButton: {
    paddingVertical: layout.spacing.xs,
    paddingHorizontal: layout.spacing.medium,
    minHeight: layout.sizes.buttonHeight.small,
  },
  mediumButton: {
    paddingVertical: layout.spacing.small,
    paddingHorizontal: layout.spacing.medium,
    minHeight: layout.sizes.buttonHeight.medium,
  },
  largeButton: {
    paddingVertical: layout.spacing.medium,
    paddingHorizontal: layout.spacing.large,
    minHeight: layout.sizes.buttonHeight.large,
  },
  
  // Button types
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  
  // Button states
  disabledButton: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  
  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // Text types
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.white,
  },
  disabledText: {
    opacity: 0.8,
  },
  
  // Content container
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Icon styles
  icon: {
    marginRight: layout.spacing.xs,
  },
});

export default Button;
