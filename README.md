# AIR-assist Mobile Application

A React Native mobile application for AIR-assist, providing voice interaction and Bluetooth connectivity.

## Project Structure

The project follows a modular, feature-based architecture with clear separation of concerns:

```
src/
├── assets/            # Static assets like images, fonts, etc.
├── components/        # Reusable UI components
│   ├── common/        # Generic UI components (Button, Card, etc.)
│   └── features/      # Feature-specific components
├── config/            # Configuration files
├── hooks/             # Custom React hooks
├── navigation/        # Navigation configuration
├── screens/           # Screen components
├── services/          # Service implementations
├── store/             # Global state management
├── styles/            # Styling utilities and theme
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Key Features

- Voice interaction with AI assistant
- Bluetooth device connectivity
- WebSocket communication
- Offline message queuing
- Responsive UI with theme support

## Architecture Highlights

### State Management

The application uses React Context API for state management, with a modular approach:

- `AppContext`: Manages application state, settings, and messages
- `BluetoothContext`: Manages Bluetooth device connections and communication

### Custom Hooks

Custom hooks encapsulate complex logic and provide a clean API for components:

- `useAudio`: Audio recording and playback
- `useBluetooth`: Bluetooth device scanning and connection
- `useWebSocket`: WebSocket communication
- `useForm`: Form state management
- `useAppContext`: Access to AppContext
- `useBluetoothContext`: Access to BluetoothContext

### Styling System

A comprehensive theming system with:

- Consistent color palette
- Typography scale
- Spacing system
- Responsive utilities
- Platform-specific adaptations

### Navigation

React Navigation is used for screen navigation with a stack-based approach.

## Development Setup

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

### Running the App

#### Android

```
npm run android
```
or
```
yarn android
```

#### iOS

```
npm run ios
```
or
```
yarn ios
```

## Best Practices

This project follows these best practices:

- **Component Structure**: Each component is self-contained with its own styles
- **State Management**: Context API for global state, useState/useReducer for local state
- **Performance Optimization**: Memoization, lazy loading, and efficient re-rendering
- **Code Organization**: Feature-based organization with clear separation of concerns
- **Error Handling**: Comprehensive error handling and user feedback
- **Accessibility**: Support for screen readers and accessibility features
- **Testing**: Unit tests for critical functionality

## License

Copyright © 2025 AIR-assist. All rights reserved.
