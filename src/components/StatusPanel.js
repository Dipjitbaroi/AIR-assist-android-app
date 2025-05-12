/**
 * Status Panel Component
 * 
 * Displays the current connection status, Bluetooth devices list,
 * and other status indicators for the application.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BluetoothContext } from '../context/BluetoothContext';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';
import { BT_CONNECTION_STATES } from '../utils/constants';

/**
 * Status Panel Component
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.wsConnected - Whether WebSocket is connected
 * @param {boolean} props.bluetoothConnected - Whether Bluetooth is connected
 * @param {boolean} props.isListening - Whether app is in listening mode
 * @param {string} props.bluetoothStatus - Current Bluetooth connection state
 * @param {boolean} props.showDevices - Whether to show the devices list
 * @param {Function} props.onClose - Function to call when closing devices list
 * @returns {React.ReactElement} Rendered component
 */
const StatusPanel = ({
  wsConnected,
  bluetoothConnected,
  isListening,
  bluetoothStatus,
  showDevices,
  onClose,
}) => {
  // Get Bluetooth context
  const {
    discoveredDevices,
    previousDevices,
    connectToDevice,
    connectedDevice,
    isScanning,
    startScan,
  } = useContext(BluetoothContext);
  
  /**
   * Get icon name based on connection status
   * 
   * @param {string} type - Connection type (server, bluetooth, listening)
   * @returns {string} Material icon name
   */
  const getStatusIcon = (type) => {
    switch (type) {
      case 'server':
        return wsConnected ? 'cloud-done' : 'cloud-off';
      case 'bluetooth':
        return bluetoothConnected ? 'bluetooth-connected' : 'bluetooth-disabled';
      case 'listening':
        return isListening ? 'hearing' : 'hearing-disabled';
      default:
        return 'help';
    }
  };
  
  /**
   * Get color based on connection status
   * 
   * @param {string} type - Connection type (server, bluetooth, listening)
   * @returns {string} Color value
   */
  const getStatusColor = (type) => {
    switch (type) {
      case 'server':
        return wsConnected ? colors.success : colors.error;
      case 'bluetooth':
        return bluetoothConnected ? colors.success : colors.error;
      case 'listening':
        return isListening ? colors.success : colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };
  
  /**
   * Get text based on connection status
   * 
   * @param {string} type - Connection type (server, bluetooth, listening)
   * @returns {string} Status text
   */
  const getStatusText = (type) => {
    switch (type) {
      case 'server':
        return wsConnected ? 'Connected' : 'Disconnected';
      case 'bluetooth':
        return bluetoothConnected 
          ? `${connectedDevice ? connectedDevice.name || 'Device' : 'Connected'}` 
          : 'Disconnected';
      case 'listening':
        return isListening ? 'Auto-listening' : 'Manual';
      default:
        return 'Unknown';
    }
  };
  
  /**
   * Handle connecting to a Bluetooth device
   * 
   * @param {Object} device - Device object to connect to
   */
  const handleDeviceConnect = async (device) => {
    try {
      await connectToDevice(device.id);
      onClose(); // Close the modal after connecting
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  };
  
  /**
   * Render a device item in the list
   * 
   * @param {Object} item - Device object
   * @returns {React.ReactElement} Rendered component
   */
  const renderDeviceItem = ({ item }) => {
    const isConnected = connectedDevice && connectedDevice.id === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.deviceItem, isConnected && styles.connectedDeviceItem]}
        onPress={() => !isConnected && handleDeviceConnect(item)}
        disabled={isConnected}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
          <Text style={styles.deviceId}>{item.id}</Text>
        </View>
        
        <View style={styles.deviceStatus}>
          {isConnected ? (
            <View style={styles.connectedIndicator}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          ) : (
            <Icon name="bluetooth" size={20} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  /**
   * Render the devices modal
   * 
   * @returns {React.ReactElement} Rendered component
   */
  const renderDevicesModal = () => {
    return (
      <Modal
        visible={showDevices}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bluetooth Devices</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Discovered devices */}
            <View style={styles.devicesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Devices</Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={startScan}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <Text style={styles.scanningText}>Scanning...</Text>
                  ) : (
                    <Icon name="refresh" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
              
              {discoveredDevices.length === 0 ? (
                <Text style={styles.emptyText}>
                  {isScanning
                    ? 'Searching for devices...'
                    : 'No devices found. Tap refresh to scan again.'}
                </Text>
              ) : (
                <FlatList
                  data={discoveredDevices}
                  renderItem={renderDeviceItem}
                  keyExtractor={(item) => item.id}
                  style={styles.devicesList}
                />
              )}
            </View>
            
            {/* Previously connected devices */}
            {previousDevices.length > 0 && (
              <View style={styles.devicesSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Previously Connected</Text>
                </View>
                
                <FlatList
                  data={previousDevices}
                  renderItem={renderDeviceItem}
                  keyExtractor={(item) => item.id}
                  style={styles.devicesList}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Connection status indicators */}
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Icon
            name={getStatusIcon('server')}
            size={20}
            color={getStatusColor('server')}
          />
          <Text style={styles.statusText}>
            Server: {getStatusText('server')}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Icon
            name={getStatusIcon('bluetooth')}
            size={20}
            color={getStatusColor('bluetooth')}
          />
          <Text style={styles.statusText}>
            BT: {getStatusText('bluetooth')}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Icon
            name={getStatusIcon('listening')}
            size={20}
            color={getStatusColor('listening')}
          />
          <Text style={styles.statusText}>
            Mode: {getStatusText('listening')}
          </Text>
        </View>
      </View>
      
      {/* Bluetooth devices modal */}
      {renderDevicesModal()}
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: layout.spacing.xs,
    paddingHorizontal: layout.spacing.medium,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: layout.spacing.xxs,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.semiTransparent,
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    ...layout.shadows.large,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  modalTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  
  closeButton: {
    padding: layout.spacing.xs,
  },
  
  devicesSection: {
    marginBottom: layout.spacing.medium,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.spacing.medium,
    paddingVertical: layout.spacing.small,
    backgroundColor: colors.backgroundDark,
  },
  
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  
  refreshButton: {
    padding: layout.spacing.xs,
  },
  
  scanningText: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: 'italic',
  },
  
  devicesList: {
    maxHeight: 200,
  },
  
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  connectedDeviceItem: {
    backgroundColor: colors.withOpacity(colors.success, 0.05),
  },
  
  deviceInfo: {
    flex: 1,
  },
  
  deviceName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  
  deviceId: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  deviceStatus: {
    marginLeft: layout.spacing.medium,
  },
  
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  connectedText: {
    ...typography.caption,
    color: colors.success,
    marginLeft: layout.spacing.xxs,
  },
  
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: layout.spacing.medium,
  },
});

export default StatusPanel;
