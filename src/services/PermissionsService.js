import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSION_CODES } from '../utils/constants';

class PermissionsServiceClass {
  /**
   * Request all necessary Android permissions
   */
  async requestAndroidPermissions() {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Required for Bluetooth scanning on Android
      ];
      
      // Add Bluetooth permissions for Android 12+
      if (Platform.Version >= 31) { // Android 12
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      }
      
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );
      
      return allGranted;
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      return false;
    }
  }

  /**
   * Request all necessary iOS permissions
   */
  async requestIOSPermissions() {
    // iOS permissions are handled by the respective libraries
    return true;
  }

  /**
   * Check audio permission
   */
  async checkAudioPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return granted;
      }
      
      // On iOS, the permission check is handled by the audio recording library
      return true;
    } catch (error) {
      console.error('Error checking audio permission:', error);
      return false;
    }
  }

  /**
   * Request audio permission
   */
  async requestAudioPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'AIRAssist Audio Permission',
            message: 'AIRAssist needs access to your microphone to listen to your voice commands.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      // On iOS, the permission request is handled by the audio recording library
      return true;
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      return false;
    }
  }

  /**
   * Check Android Bluetooth permissions
   */
  async checkAndroidBluetoothPermissions() {
    try {
      if (Platform.OS !== 'android') return true;
      
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
      
      // Add Bluetooth permissions for Android 12+
      if (Platform.Version >= 31) { // Android 12
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      }
      
      const results = await Promise.all(
        permissions.map(permission => PermissionsAndroid.check(permission))
      );
      
      return results.every(result => result);
    } catch (error) {
      console.error('Error checking Android Bluetooth permissions:', error);
      return false;
    }
  }

  /**
   * Request Android Bluetooth permissions
   */
  async requestAndroidBluetoothPermissions() {
    try {
      if (Platform.OS !== 'android') return true;
      
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
      
      // Add Bluetooth permissions for Android 12+
      if (Platform.Version >= 31) { // Android 12
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      }
      
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );
      
      return allGranted;
    } catch (error) {
      console.error('Error requesting Android Bluetooth permissions:', error);
      return false;
    }
  }
}

export const PermissionsService = new PermissionsServiceClass();
