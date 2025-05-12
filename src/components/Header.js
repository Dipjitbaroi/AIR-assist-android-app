/**
 * Header Component
 * 
 * Application header that includes the title, Bluetooth connection indicator,
 * and navigation to settings.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

/**
 * Header Component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.title - Header title
 * @param {Function} props.onSettingsPress - Function to call when settings icon is pressed
 * @param {Object} [props.connectedDevice] - Connected Bluetooth device, if any
 * @param {Function} props.onBluetoothPress - Function to call when Bluetooth icon is pressed
 * @returns {React.ReactElement} Rendered component
 */
const Header = ({
  title,
  onSettingsPress,
  connectedDevice,
  onBluetoothPress,
}) => {
  /**
   * Get Bluetooth icon based on connection state
   * 
   * @returns {string} Material icon name
   */
  const getBluetoothIcon = () => {
    if (!connectedDevice) {
      return 'bluetooth-disabled';
    }
    
    return 'bluetooth-connected';
  };
  
  /**
   * Get Bluetooth icon color based on connection state
   * 
   * @returns {string} Color value
   */
  const getBluetoothIconColor = () => {
    if (!connectedDevice) {
      return colors.textLight;
    }
    
    return colors.success;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBluetoothPress}
          activeOpacity={0.7}
        >
          <Icon
            name={getBluetoothIcon()}
            size={24}
            color={getBluetoothIconColor()}
          />
          
          {connectedDevice && (
            <View style={styles.deviceIndicator}>
              <View style={styles.deviceDot} />
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSettingsPress}
          activeOpacity={0.7}
        >
          <Icon
            name="settings"
            size={24}
            color={colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: layout.sizes.headerHeight,
    backgroundColor: colors.primary,
    paddingHorizontal: layout.spacing.medium,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  title: {
    ...typography.h4,
    color: colors.textLight,
  },
  
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  iconButton: {
    padding: layout.spacing.xs,
    marginLeft: layout.spacing.medium,
    position: 'relative',
  },
  
  deviceIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  deviceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
});

export default Header;
