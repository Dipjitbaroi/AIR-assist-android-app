import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';
import { BluetoothContext } from '../context/BluetoothContext';

const StatusPanel = ({ 
  wsConnected, 
  bluetoothConnected, 
  isListening,
  bluetoothStatus,
  showDevices,
  onClose
}) => {
  const { 
    devices, 
    connectedDevice, 
    isScanning, 
    startScan, 
    connectToDevice 
  } = useContext(BluetoothContext);
  
  // Render a device item in the list
  const renderDeviceItem = ({ item }) => {
    const isConnected = connectedDevice && connectedDevice.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.deviceItem,
          isConnected && styles.connectedDeviceItem
        ]}
        onPress={() => {
          if (!isConnected) {
            connectToDevice(item);
          }
        }}
        disabled={isConnected}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceId}>{item.id}</Text>
        </View>
        <View style={styles.deviceStatus}>
          {isConnected ? (
            <Icon name="bluetooth-connected" size={24} color={colors.success} />
          ) : (
            <Icon name="bluetooth" size={24} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.statusItem}>
        <Icon 
          name={wsConnected ? 'cloud-done' : 'cloud-off'} 
          size={20} 
          color={wsConnected ? colors.success : colors.error} 
        />
        <Text style={styles.statusText}>
          {wsConnected ? 'Connected to server' : 'Disconnected from server'}
        </Text>
      </View>
      
      <View style={styles.statusItem}>
        <Icon 
          name={bluetoothConnected ? 'bluetooth-connected' : 'bluetooth-disabled'} 
          size={20} 
          color={bluetoothConnected ? colors.success : colors.error} 
        />
        <Text style={styles.statusText}>
          {bluetoothConnected 
            ? `Connected to ${connectedDevice.name}` 
            : 'No Bluetooth device connected'}
        </Text>
      </View>
      
      <View style={styles.statusItem}>
        <Icon 
          name={isListening ? 'hearing' : 'hearing-disabled'} 
          size={20} 
          color={isListening ? colors.success : colors.textSecondary} 
        />
        <Text style={styles.statusText}>
          {isListening ? 'Auto-listening enabled' : 'Auto-listening disabled'}
        </Text>
      </View>
      
      <Modal
        visible={showDevices}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bluetooth Devices</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={devices}
              renderItem={renderDeviceItem}
              keyExtractor={(item) => item.id}
              style={styles.deviceList}
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderText}>
                    {isScanning 
                      ? 'Scanning for devices...' 
                      : devices.length > 0 
                        ? 'Available devices:' 
                        : 'No devices found'}
                  </Text>
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Icon name="bluetooth-searching" size={48} color={colors.border} />
                  <Text style={styles.emptyListText}>
                    {isScanning 
                      ? 'Searching for devices...' 
                      : 'No Bluetooth devices found'}
                  </Text>
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={startScan}
                  disabled={isScanning}
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'Scanning...' : 'Scan for Devices'}
                  </Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDark,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundDark,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  deviceList: {
    maxHeight: 400,
  },
  listHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listHeaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  connectedDeviceItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  deviceId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deviceStatus: {
    marginLeft: 8,
  },
  emptyList: {
    padding: 24,
    alignItems: 'center',
  },
  emptyListText: {
    marginTop: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 12,
    margin: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  scanButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default StatusPanel;
