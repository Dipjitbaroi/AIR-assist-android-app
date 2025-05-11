import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './src/context/AppContext';
import { BluetoothProvider } from './src/context/BluetoothContext';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/styles/colors';
import { PermissionsService } from './src/services/PermissionsService';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Possible Unhandled Promise Rejection',
  'Non-serializable values were found in the navigation state',
  'componentWillReceiveProps has been renamed',
  'Require cycle:'
]);

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // Request permissions when the app starts
    const requestInitialPermissions = async () => {
      try {
        if (Platform.OS === 'android') {
          await PermissionsService.requestAndroidPermissions();
        } else if (Platform.OS === 'ios') {
          await PermissionsService.requestIOSPermissions();
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    requestInitialPermissions();
  }, []);

  return (
    <AppProvider>
      <BluetoothProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.primary}
          />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'AIRAssist' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </BluetoothProvider>
    </AppProvider>
  );
};

export default App;
