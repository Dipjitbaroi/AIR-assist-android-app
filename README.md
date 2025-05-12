# AIR-assist Android Application

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.71.8-blue.svg)](https://reactnative.dev/)
[![Platform](https://img.shields.io/badge/Platform-Android-green.svg)](https://www.android.com/)

A voice-controlled AI assistant application optimized for hands-free use with Bluetooth headsets.

## Overview

AIR-assist provides a seamless voice interface to interact with an AI assistant through Bluetooth audio devices. The application is designed for portable, hands-free operation, allowing users to communicate with the AI assistant while on the go, driving, or in situations where hands-free operation is preferred.

## Features

- **Voice-Controlled AI Interactions**: Send voice commands and receive audio responses
- **Bluetooth Headset Integration**: Optimized for wireless headsets and earbuds
- **Conversation History**: View and manage your conversation with the AI assistant
- **Auto-Listening Mode**: Automatically start listening after AI responses
- **Offline Message Queuing**: Save messages when disconnected for later processing
- **Customizable Settings**: Adjust audio sensitivity, voice types, and behavior
- **Visual Conversation Display**: Text transcription of both user input and AI responses

## Architecture

The application follows a modern React Native architecture with the following key components:

### Core Technologies

- **React Native 0.71.8**: Framework for building the mobile application
- **Context API**: State management for application-wide data
- **WebSockets**: Real-time communication with the AI backend server
- **BLE (Bluetooth Low Energy)**: Communication with Bluetooth audio devices
- **Native Audio Services**: Recording and playback of audio

### Directory Structure

```
src/
├── components/       # UI components
│   ├── common/       # Reusable UI elements
│   └── ...           # Feature-specific components
├── context/          # Context providers for state management
├── screens/          # Application screens
├── services/         # Business logic and external services
├── styles/           # Styling constants and utilities
└── utils/            # Helper functions and constants
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- JDK 11+
- Android Studio
- Android SDK (API level 21+)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AIR-assist-android-app.git
   cd AIR-assist-android-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Android SDK:
   - Ensure ANDROID_HOME environment variable is set correctly
   - Install required SDK platforms and build tools

4. Start the Metro bundler:
   ```bash
   npm start
   ```

5. Run the application:
   ```bash
   npm run android
   ```

### Common Setup Issues

#### Android project not found
If you encounter an error like "Android project not found", ensure that:
- The android directory exists in your project
- You have properly configured the project.android.sourceDir option in package.json

```bash
# Fix missing android directory
node fix-gradle-wrapper.js
```

#### Gradle wrapper issues
If you encounter Gradle wrapper errors, run:
```bash
cd android
gradle wrapper --gradle-version 7.5.1
cd ..
```

## Development Guide

### Key Files

- **App.js**: Application entry point and navigation setup
- **src/context/AppContext.js**: Main state management for the app
- **src/context/BluetoothContext.js**: Bluetooth device management
- **src/screens/HomeScreen.js**: Main interface for the assistant
- **src/screens/SettingsScreen.js**: Configuration options
- **src/services/WebSocketService.js**: Communication with AI backend
- **src/services/AudioService.js**: Audio recording and playback

### State Management

The application uses React Context API for state management, with two main contexts:

1. **AppContext**: Manages app-wide state including:
   - WebSocket connection state
   - Messages and conversation history
   - Settings and preferences
   - Audio processing state

2. **BluetoothContext**: Handles Bluetooth-related functionality:
   - Device discovery and connection
   - Connection state management
   - Data transfer with connected devices

### Adding New Features

When adding new features, follow these guidelines:

1. **Create Components**: Add new UI components in the appropriate directory
2. **Update Context**: Extend context providers if new state is required
3. **Services**: Add business logic in the services directory
4. **Styling**: Use the centralized styles from src/styles
5. **Testing**: Add tests for new functionality

## Customization

### Theming

The application uses a centralized theming system in `src/styles/colors.js`. Modify this file to change the application's color scheme.

### Configuration

Default settings are defined in `src/utils/constants.js`. Adjust these values to change the default behavior of the application.

## Troubleshooting

### Connection Issues

If the application fails to connect to the AI backend:
1. Check the WebSocket server URL in settings
2. Ensure your device has internet connectivity
3. Verify that the server is running and accessible

### Bluetooth Problems

If Bluetooth devices aren't connecting properly:
1. Ensure Bluetooth is enabled on your device
2. Check that necessary permissions are granted
3. Try restarting the Bluetooth service on your device
4. Make sure the device is in pairing mode

### Audio Recording Issues

If voice recording isn't working:
1. Check microphone permissions
2. Verify that the microphone isn't being used by another application
3. Adjust the microphone sensitivity in settings
4. Ensure that the device has a working microphone

## API Integration

The application communicates with the AI backend server using WebSockets. The protocol is defined as follows:

### Client-to-Server Messages

```json
{
  "type": "audioMessage",
  "audio": "base64-encoded-audio-data",
  "transcription": "optional-text-transcription",
  "userId": "user-identifier",
  "userName": "user-display-name",
  "voice": "preferred-voice-type",
  "timestamp": 1621234567890,
  "messageId": "unique-message-identifier"
}
```

### Server-to-Client Messages

```json
{
  "type": "aiResponse",
  "text": "Text response from the AI",
  "audioBase64": "base64-encoded-audio-data",
  "messageId": "reference-to-original-message-id",
  "timestamp": 1621234567890
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Native community for the excellent framework
- Contributors and maintainers of the dependencies used in this project
- All users who provide feedback and suggestions

---

## Contribution Guidelines

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding style and includes appropriate documentation.
