/**
 * TextInput Component
 * 
 * A customizable text input component with various states and styling options.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { 
  View, 
  TextInput as RNTextInput, 
  Text, 
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../styles/theme';

const { colors, typography, spacing } = theme;

/**
 * TextInput Component
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.label] - Input label
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.value] - Input value
 * @param {Function} [props.onChangeText] - Function to call when text changes
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.helperText] - Helper text to display below input
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @param {string} [props.leftIcon] - Name of icon to display on the left (from MaterialIcons)
 * @param {string} [props.rightIcon] - Name of icon to display on the right (from MaterialIcons)
 * @param {Function} [props.onLeftIconPress] - Function to call when left icon is pressed
 * @param {Function} [props.onRightIconPress] - Function to call when right icon is pressed
 * @param {boolean} [props.secureTextEntry=false] - Whether to hide the text being entered
 * @param {string} [props.variant='outlined'] - Input style variant (outlined, filled)
 * @param {Object} [props.style] - Additional style for the input container
 * @param {Object} [props.inputStyle] - Additional style for the input element
 * @returns {React.ReactElement} Rendered component
 */
const TextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  disabled = false,
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  secureTextEntry = false,
  variant = 'outlined',
  style,
  inputStyle,
  ...rest
}) => {
  // State for password visibility toggle
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  
  // State for focus
  const [isFocused, setIsFocused] = useState(false);
  
  /**
   * Get container style based on variant, focus, error, and disabled state
   * 
   * @returns {Array} Array of style objects
   */
  const getContainerStyle = () => {
    const containerStyles = [styles.container, styles[`${variant}Container`]];
    
    if (isFocused) {
      containerStyles.push(styles.focusedContainer);
    }
    
    if (error) {
      containerStyles.push(styles.errorContainer);
    }
    
    if (disabled) {
      containerStyles.push(styles.disabledContainer);
    }
    
    if (style) {
      containerStyles.push(style);
    }
    
    return containerStyles;
  };
  
  /**
   * Get input style based on variant and disabled state
   * 
   * @returns {Array} Array of style objects
   */
  const getInputStyle = () => {
    const inputStyles = [styles.input];
    
    if (leftIcon) {
      inputStyles.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon || secureTextEntry) {
      inputStyles.push(styles.inputWithRightIcon);
    }
    
    if (disabled) {
      inputStyles.push(styles.disabledInput);
    }
    
    if (inputStyle) {
      inputStyles.push(inputStyle);
    }
    
    return inputStyles;
  };
  
  /**
   * Render left icon if provided
   * 
   * @returns {React.ReactElement|null} Icon component or null
   */
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    const iconComponent = (
      <View style={styles.leftIconContainer}>
        <Icon
          name={leftIcon}
          size={20}
          color={disabled ? colors.textDisabled : colors.textSecondary}
        />
      </View>
    );
    
    if (onLeftIconPress) {
      return (
        <TouchableOpacity
          onPress={onLeftIconPress}
          disabled={disabled}
        >
          {iconComponent}
        </TouchableOpacity>
      );
    }
    
    return iconComponent;
  };
  
  /**
   * Render right icon if provided or if secureTextEntry is true
   * 
   * @returns {React.ReactElement|null} Icon component or null
   */
  const renderRightIcon = () => {
    // If secureTextEntry is true, show password visibility toggle
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          disabled={disabled}
        >
          <Icon
            name={isPasswordVisible ? 'visibility' : 'visibility-off'}
            size={20}
            color={disabled ? colors.textDisabled : colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    
    // Otherwise, show custom right icon if provided
    if (!rightIcon) return null;
    
    const iconComponent = (
      <View style={styles.rightIconContainer}>
        <Icon
          name={rightIcon}
          size={20}
          color={disabled ? colors.textDisabled : colors.textSecondary}
        />
      </View>
    );
    
    if (onRightIconPress) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          disabled={disabled}
        >
          {iconComponent}
        </TouchableOpacity>
      );
    }
    
    return iconComponent;
  };
  
  return (
    <View style={styles.wrapper}>
      {/* Label */}
      {label && (
        <Text style={[
          styles.label,
          error && styles.errorLabel,
          disabled && styles.disabledLabel,
        ]}>
          {label}
        </Text>
      )}
      
      {/* Input container */}
      <View style={getContainerStyle()}>
        {renderLeftIcon()}
        
        <RNTextInput
          style={getInputStyle()}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={!disabled}
          placeholderTextColor={colors.textDisabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        
        {renderRightIcon()}
      </View>
      
      {/* Error message or helper text */}
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error && styles.errorText,
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.medium,
  },
  
  // Label styles
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  errorLabel: {
    color: colors.error,
  },
  disabledLabel: {
    color: colors.textDisabled,
  },
  
  // Container styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
  },
  outlinedContainer: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  filledContainer: {
    backgroundColor: colors.backgroundDark,
  },
  focusedContainer: {
    borderColor: colors.primary,
  },
  errorContainer: {
    borderColor: colors.error,
  },
  disabledContainer: {
    backgroundColor: colors.backgroundDark,
    borderColor: colors.border,
  },
  
  // Input styles
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    minHeight: 48,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  disabledInput: {
    color: colors.textDisabled,
  },
  
  // Icon container styles
  leftIconContainer: {
    paddingLeft: spacing.medium,
    paddingRight: spacing.xs,
  },
  rightIconContainer: {
    paddingRight: spacing.medium,
    paddingLeft: spacing.xs,
  },
  
  // Helper text styles
  helperText: {
    ...typography.caption,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
  },
});

export default TextInput;
