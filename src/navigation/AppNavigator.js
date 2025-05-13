/**
 * App Navigator
 * 
 * Defines the navigation structure for the application.
 * Uses React Navigation to manage screens and navigation flow.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Styles
import theme from '../styles/theme';

// Create navigation stacks
const Stack = createStackNavigator();

/**
 * Main stack navigator
 * 
 * @returns {React.ReactElement} Stack navigator component
 */
const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
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
  );
};

/**
 * Root navigator component
 * 
 * @returns {React.ReactElement} Navigation container with navigators
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};

export default AppNavigator;
