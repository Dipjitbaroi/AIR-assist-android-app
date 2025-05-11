import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '../context/AppContext';
import { BluetoothContext } from '../context/BluetoothContext';
import { colors } from '../styles/colors';
import { SILENCE_DETECTION, APP_VERSION } from '../utils/constants';
import { StorageService } from '../services/StorageService';

const SettingsScreen = ({ navigation }) => {
  const { settings, updateSettings, clearConversation } = useContext(AppContext);
  const { savedDevices, forgetDevice } = useContext(BluetoothContext);
  
  const [localSettings, setLocalSettings] = useState({ ...settings });
  
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);
  
  const handleUpdate = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const saveSettings = () => {
    updateSettings(localSettings);
    Alert.alert('Success', 'Settings saved successfully');
  };
  
  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            StorageService.clearAllData().then(() => {
              Alert.alert('Success', 'All settings have been reset. The app will now restart.');
              // In a real app, you'd need to restart the app here
              navigation.goBack();
            });
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Settings</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={localSettings.userName}
              onChangeText={(text) => handleUpdate('userName', text)}
              placeholder="Enter your name"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Settings</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>WebSocket URL</Text>
            <TextInput
              style={styles.input}
              value={localSettings.wsServerUrl}
              onChangeText={(text) => handleUpdate('wsServerUrl', text)}
              placeholder="wss://your-websocket-server.com"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>AI Voice</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={localSettings.aiVoice}
                onValueChange={(value) => handleUpdate('aiVoice', value)}
                style={styles.picker}
                dropdownIconColor={colors.textPrimary}
              >
                <Picker.Item label="Default" value="default" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
              </Picker>
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Auto-Listen Mode</Text>
            <Switch
              value={localSettings.autoListen}
              onValueChange={(value) => handleUpdate('autoListen', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={localSettings.autoListen ? colors.accent : colors.white}
            />
          </View>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.label}>
              Silence Threshold: {localSettings.silenceThreshold}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={SILENCE_DETECTION.MIN_THRESHOLD}
              maximumValue={SILENCE_DETECTION.MAX_THRESHOLD}
              step={1}
              value={localSettings.silenceThreshold}
              onValueChange={(value) => handleUpdate('silenceThreshold', value)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.accent}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Low (More Sensitive)</Text>
              <Text style={styles.sliderLabel}>High (Less Sensitive)</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Bluetooth Devices</Text>
          {savedDevices.length > 0 ? (
            savedDevices.map((device) => (
              <View key={device.id} style={styles.deviceItem}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceId}>{device.id}</Text>
                  {device.lastConnected && (
                    <View style={styles.lastConnectedBadge}>
                      <Text style={styles.lastConnectedText}>Last Connected</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.forgetButton}
                  onPress={() => {
                    Alert.alert(
                      'Forget Device',
                      `Are you sure you want to forget ${device.name}?`,
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                        {
                          text: 'Forget',
                          onPress: () => forgetDevice(device.id),
                          style: 'destructive',
                        },
                      ]
                    );
                  }}
                >
                  <Icon name="delete" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noDevicesText}>No saved devices</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              Alert.alert(
                'Clear Conversation History',
                'Are you sure you want to clear all conversation history?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Clear',
                    onPress: clearConversation,
                    style: 'destructive',
                  },
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>Clear Conversation History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={resetSettings}
          >
            <Text style={styles.buttonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.infoText}>AIRAssist v{APP_VERSION}</Text>
          <Text style={styles.infoText}>© 2025 Your Company</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveSettings}
          >
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
    height: 48,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slider: {
    height: 40,
    width: '100%',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
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
  lastConnectedBadge: {
    backgroundColor: colors.success,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  lastConnectedText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  forgetButton: {
    padding: 8,
  },
  noDevicesText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
});

export default SettingsScreen;
