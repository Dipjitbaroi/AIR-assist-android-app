/**
 * AIR-assist Application Entry Point
 * 
 * This is the main entry point for the AIR-assist application.
 * The AppRegistry is the JavaScript entry point to running all React Native apps.
 * 
 * @format
 * @author AIR-assist Development Team
 * @version 1.0.0
 * @copyright 2025 AIR-assist
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Register the main component for the application
// This tells React Native which component is the root of the application
AppRegistry.registerComponent(appName, () => App);
