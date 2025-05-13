/**
 * AIR-assist Main Application Component
 * 
 * This is the root component of the AIR-assist application. It orchestrates the main
 * navigation and context providers for the app.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 * @copyright 2025 AIR-assist
 */

import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, LogBox, Platform } from 'react-native';

// Root Provider
import RootProvider from './src/store';

// Navigation
import AppNavigator from './src/navigation';

// Utils
import { permissions } from './src/utils';
import theme from './src/styles/theme';

/**
 * Ignore specific warnings that are known issues but don't affect functionality
 * 
 * - Promise Rejection warnings are often related to timeouts in third-party libraries
 * - Navigation state warnings are due to passing functions as route params
 * - componentWillReceiveProps warnings are from third-party libraries that need updating
 * - Require cycle warnings are common and unavoidable with circular dependencies
 */
LogBox.ignoreLogs([
  'Possible Unhandled Promise Rejection',
  'Non-serializable values were found in the navigation state',
  'componentWillReceiveProps has been renamed',
  'Require cycle:'
]);

/**
 * Main App Component
 * 
 * This is the root component of the application that sets up:
 * - Context providers for global state management
 * - Navigation container and stack
 * - Initial permission requests
 * - Basic UI elements (StatusBar, SafeAreaView)
 * 
 * @returns {React.ReactElement} The rendered application
 */
const App = () => {
  /**
   * Request necessary permissions when the app first loads
   * Different permissions are required based on platform (iOS vs Android)
   */
  useEffect(() => {
    const requestInitialPermissions = async () => {
      try {
        // Request platform-specific permissions
        if (Platform.OS === 'android') {
          await permissions.requestAndroidPermissions();
        } else if (Platform.OS === 'ios') {
          await permissions.requestIOSPermissions();
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        // We don't halt app execution for permission failures,
        // but features requiring those permissions won't work
      }
    };

    // Execute the permission request
    requestInitialPermissions();
  }, []);

  return (
    <RootProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Configure status bar appearance */}
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
        />
        
        {/* Main navigation */}
        <AppNavigator />
      </SafeAreaView>
    </RootProvider>
  );
};

export default App;
