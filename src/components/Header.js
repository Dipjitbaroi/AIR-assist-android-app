import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';

const Header = ({ title, onSettingsPress, connectedDevice, onBluetoothPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Icon name="assistant" size={24} color={colors.white} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onBluetoothPress}>
          <Icon
            name={connectedDevice ? 'bluetooth-connected' : 'bluetooth'}
            size={24}
            color={connectedDevice ? colors.success : colors.white}
          />
          {connectedDevice && (
            <View style={styles.connectionDot} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onSettingsPress}>
          <Icon name="settings" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    color: colors.white,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  connectionDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
});

export default Header;
