import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Get device information
export const getDeviceInfo = async () => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceName = await DeviceInfo.getDeviceName();
    const systemVersion = DeviceInfo.getSystemVersion();
    const appVersion = DeviceInfo.getVersion();
    const batteryLevel = await DeviceInfo.getBatteryLevel();
    const isTablet = DeviceInfo.isTablet();
    const manufacturer = await DeviceInfo.getManufacturer();
    const model = await DeviceInfo.getModel();
    
    return {
      deviceId,
      deviceName,
      systemName: Platform.OS,
      systemVersion,
      appVersion,
      batteryLevel,
      isTablet,
      manufacturer,
      model,
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      deviceId: 'unknown',
      deviceName: 'unknown',
      systemName: Platform.OS,
      systemVersion: 'unknown',
      appVersion: 'unknown',
      batteryLevel: -1,
      isTablet: false,
      manufacturer: 'unknown',
      model: 'unknown',
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
    };
  }
};

// Get device network information
export const getNetworkInfo = async () => {
  try {
    const isConnected = await DeviceInfo.isNetworkAvailable();
    const type = await DeviceInfo.getNetworkType();
    
    return {
      isConnected,
      type,
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return {
      isConnected: false,
      type: 'unknown',
    };
  }
};
