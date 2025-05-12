/**
 * Settings Screen
 * 
 * Allows users to configure application settings including
 * server connection, audio preferences, and behavior options.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import DeviceInfo from 'react-native-device-info';

// Contexts
import { AppContext } from '../context/AppContext';
import { BluetoothContext } from '../context/BluetoothContext';

// Styles and utilities
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { DEFAULT_SETTINGS } from '../utils/constants';

/**
 * Settings Screen Component
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.navigation - Navigation object
 * @returns {React.ReactElement} Rendered component
 */
const SettingsScreen = ({ navigation }) => {
  // App context
  const { settings, updateSettings } = useContext(AppContext);
  
  // Bluetooth context
  const { connectedDevice, disconnectFromDevice } = useContext(BluetoothContext);
  
  // Local state for settings before saving
  const [localSettings, setLocalSettings] = useState({ ...settings });
  
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    connection: true,
    audio: false,
    behavior: false,
    about: false,
  });
  
  /**
   * Toggle a section's expanded state
   * 
   * @param {string} section - Section identifier
   */
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };
  
  /**
   * Update a local setting value
   * 
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  const handleSettingChange = (key, value) => {
    setLocalSettings({
      ...localSettings,
      [key]: value,
    });
    
    // Immediately update global settings (could be debounced for performance)
    updateSettings({ [key]: value });
  };
  
  /**
   * Reset settings to defaults
   */
  const handleResetSettings = () => {
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
            // Keep the user ID when resetting
            const userId = settings.userId;
            const newSettings = { ...DEFAULT_SETTINGS, userId };
            
            setLocalSettings(newSettings);
            updateSettings(newSettings);
            
            Alert.alert('Success', 'Settings have been reset to defaults.');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  /**
   * Disconnect from Bluetooth device
   */
  const handleDisconnectDevice = () => {
    if (connectedDevice) {
      Alert.alert(
        'Disconnect Device',
        `Are you sure you want to disconnect from ${connectedDevice.name || connectedDevice.id}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disconnect',
            onPress: () => {
              disconnectFromDevice(connectedDevice.id)
                .then(() => {
                  Alert.alert('Success', 'Device disconnected successfully.');
                })
                .catch(error => {
                  console.error('Error disconnecting device:', error);
                  Alert.alert('Error', 'Failed to disconnect device.');
                });
            },
            style: 'destructive',
          },
        ]
      );
    }
  };
  
  /**
   * Get app version information
   * 
   * @returns {string} Version string
   */
  const getVersionInfo = () => {
    const version = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    
    return `Version ${version} (${buildNumber})`;
  };
  
  /**
   * Render a settings section
   * 
   * @param {string} title - Section title
   * @param {string} id - Section identifier
   * @param {React.ReactNode} children - Section content
   * @returns {React.ReactElement} Rendered section
   */
  const renderSection = (title, id, children) => {
    const isExpanded = expandedSections[id];
    
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(id)}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Icon
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  };
  
  /**
   * Render a setting row with a switch
   * 
   * @param {string} title - Setting title
   * @param {string} description - Setting description
   * @param {string} settingKey - Setting key in settings object
   * @returns {React.ReactElement} Rendered setting row
   */
  const renderSwitchSetting = (title, description, settingKey) => {
    return (
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        
        <Switch
          value={localSettings[settingKey]}
          onValueChange={(value) => handleSettingChange(settingKey, value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={localSettings[settingKey] ? colors.primaryLight : colors.veryLightGray}
        />
      </View>
    );
  };
  
  /**
   * Render a setting row with a slider
   * 
   * @param {string} title - Setting title
   * @param {string} description - Setting description
   * @param {string} settingKey - Setting key in settings object
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} step - Step value
   * @returns {React.ReactElement} Rendered setting row
   */
  const renderSliderSetting = (title, description, settingKey, min, max, step) => {
    return (
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            value={localSettings[settingKey]}
            minimumValue={min}
            maximumValue={max}
            step={step}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            onValueChange={(value) => handleSettingChange(settingKey, value)}
          />
          <Text style={styles.sliderValue}>{localSettings[settingKey]}</Text>
        </View>
      </View>
    );
  };
  
  /**
   * Render a setting row with a text input
   * 
   * @param {string} title - Setting title
   * @param {string} description - Setting description
   * @param {string} settingKey - Setting key in settings object
   * @param {string} placeholder - Input placeholder
   * @returns {React.ReactElement} Rendered setting row
   */
  const renderTextSetting = (title, description, settingKey, placeholder) => {
    return (
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        
        <TextInput
          style={styles.textInput}
          value={localSettings[settingKey]}
          onChangeText={(text) => handleSettingChange(settingKey, text)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    );
  };
  
  /**
   * Render a setting row with a picker
   * 
   * @param {string} title - Setting title
   * @param {string} description - Setting description
   * @param {string} settingKey - Setting key in settings object
   * @param {Array} options - Picker options
   * @returns {React.ReactElement} Rendered setting row
   */
  const renderPickerSetting = (title, description, settingKey, options) => {
    return (
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={localSettings[settingKey]}
            style={styles.picker}
            onValueChange={(value) => handleSettingChange(settingKey, value)}
          >
            {options.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Connection Settings */}
        {renderSection('Connection Settings', 'connection', (
          <>
            {renderTextSetting(
              'Server URL',
              'WebSocket server address for AI assistant',
              'wsServerUrl',
              'wss://example.com/ws'
            )}
            
            {renderTextSetting(
              'User Name',
              'Your name for the AI to address you',
              'userName',
              'Your Name'
            )}
            
            {connectedDevice && (
              <View style={styles.deviceInfo}>
                <View style={styles.deviceHeader}>
                  <Text style={styles.deviceTitle}>Connected Device</Text>
                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={handleDisconnectDevice}
                  >
                    <Text style={styles.disconnectText}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.deviceName}>{connectedDevice.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceId}>{connectedDevice.id}</Text>
              </View>
            )}
          </>
        ))}
        
        {/* Audio Settings */}
        {renderSection('Audio Settings', 'audio', (
          <>
            {renderPickerSetting(
              'AI Voice',
              'Voice used for AI responses',
              'aiVoice',
              [
                { label: 'Default', value: 'default' },
                { label: 'Female', value: 'female' },
                { label: 'Male', value: 'male' },
                { label: 'Neutral', value: 'neutral' },
              ]
            )}
            
            {renderSliderSetting(
              'Microphone Sensitivity',
              'Adjust microphone input level',
              'micSensitivity',
              0,
              100,
              5
            )}
            
            {renderSliderSetting(
              'Silence Threshold',
              'Sensitivity for detecting silence',
              'silenceThreshold',
              0,
              1,
              0.1
            )}
            
            {renderSliderSetting(
              'Speaker Volume',
              'Volume level for AI responses',
              'speakerVolume',
              0,
              100,
              5
            )}
          </>
        ))}
        
        {/* Behavior Settings */}
        {renderSection('Behavior Settings', 'behavior', (
          <>
            {renderSwitchSetting(
              'Auto-Listen',
              'Automatically listen after AI response',
              'autoListen'
            )}
            
            {renderSwitchSetting(
              'Auto-Connect',
              'Automatically connect to last Bluetooth device',
              'autoConnect'
            )}
            
            {renderSwitchSetting(
              'Save History',
              'Save conversation history',
              'saveHistory'
            )}
            
            {renderSwitchSetting(
              'Read Responses',
              'Read AI responses aloud',
              'readResponses'
            )}
            
            {renderPickerSetting(
              'Theme',
              'Application appearance theme',
              'theme',
              [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'System Default', value: 'system' },
              ]
            )}
          </>
        ))}
        
        {/* About Section */}
        {renderSection('About', 'about', (
          <View style={styles.aboutSection}>
            <Text style={styles.appName}>AIR-assist</Text>
            <Text style={styles.versionInfo}>{getVersionInfo()}</Text>
            <Text style={styles.aboutDescription}>
              AIR-assist provides an AI voice assistant interface optimized for
              Bluetooth headsets and portable use. Communicate hands-free with
              a powerful AI assistant.
            </Text>
            
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleResetSettings}
              >
                <Icon name="refresh" size={20} color={colors.error} />
                <Text style={[styles.buttonText, styles.resetButtonText]}>
                  Reset Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContent: {
    padding: layout.spacing.medium,
  },
  
  section: {
    marginBottom: layout.spacing.large,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    ...layout.shadows.small,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.spacing.medium,
    borderBottomWidth: expandedSections => expandedSections ? 1 : 0,
    borderBottomColor: colors.border,
  },
  
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  
  sectionContent: {
    padding: layout.spacing.medium,
  },
  
  settingRow: {
    marginBottom: layout.spacing.medium,
  },
  
  settingInfo: {
    marginBottom: layout.spacing.small,
  },
  
  settingTitle: {
    ...typography.bodyMedium,
    ...typography.medium,
    color: colors.textPrimary,
    marginBottom: layout.spacing.xxs,
  },
  
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: layout.spacing.small,
    backgroundColor: colors.white,
  },
  
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: layout.spacing.small,
  },
  
  slider: {
    flex: 1,
    height: 40,
  },
  
  sliderValue: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: layout.spacing.small,
    minWidth: 30,
    textAlign: 'center',
  },
  
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.white,
    marginTop: layout.spacing.small,
  },
  
  picker: {
    height: 50,
    width: '100%',
  },
  
  deviceInfo: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: layout.spacing.medium,
    marginTop: layout.spacing.medium,
  },
  
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.small,
  },
  
  deviceTitle: {
    ...typography.bodyMedium,
    ...typography.medium,
    color: colors.textPrimary,
  },
  
  disconnectButton: {
    paddingVertical: layout.spacing.xxs,
    paddingHorizontal: layout.spacing.small,
    backgroundColor: colors.error,
    borderRadius: 4,
  },
  
  disconnectText: {
    ...typography.caption,
    color: colors.white,
  },
  
  deviceName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  
  deviceId: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  aboutSection: {
    alignItems: 'center',
  },
  
  appName: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: layout.spacing.small,
  },
  
  versionInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: layout.spacing.medium,
  },
  
  aboutDescription: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: layout.spacing.large,
  },
  
  buttonsContainer: {
    marginTop: layout.spacing.medium,
  },
  
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: layout.spacing.small,
    paddingHorizontal: layout.spacing.medium,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  
  buttonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: layout.spacing.xxs,
  },
  
  resetButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.error,
  },
  
  resetButtonText: {
    color: colors.error,
  },
});

export default SettingsScreen;
