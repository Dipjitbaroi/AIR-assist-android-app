# Environment Configuration Guide

The AIR-assist Android application uses environment variables for configuration, allowing easy customization without code changes.

## Configuration File

Environment variables are stored in the `.env` file in the project root. This file contains configuration settings like:

```
# Application Configuration
APP_NAME=AIRAssist
APP_VERSION=1.0.0

# Server Connection
WEBSOCKET_URL=wss://api.airassist.io/ws

# Development Settings
METRO_PORT=8082
DEBUG_MODE=false
```

## Available Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `APP_NAME` | Application name | AIRAssist |
| `APP_VERSION` | Application version | 1.0.0 |
| `WEBSOCKET_URL` | WebSocket server URL | wss://api.airassist.io/ws |
| `METRO_PORT` | Metro bundler port | 8081 |
| `DEBUG_MODE` | Enable debug features | false (true in dev) |

## Custom Metro Port

The application is configured to use a custom Metro bundler port (default: 8082) to avoid conflicts with other React Native applications. This is particularly useful when:

- You have multiple React Native projects running simultaneously
- Port 8081 is already in use by another application
- You want to run multiple instances of the application

## Using Custom Scripts

We provide several custom scripts to make working with environment variables easier:

### Check Environment Configuration

```bash
npm run check-env
```

This script displays the current environment configuration and checks if the configured Metro port is available.

### Start Metro with Custom Port

```bash
npm run start:env
```

Starts the Metro bundler using the port specified in the `.env` file.

### Run Android with Custom Port

```bash
npm run android:env
```

Runs the Android application using the Metro bundler on the custom port.

### Quick Start

For Windows users, a convenient batch file is provided:

```bash
start.bat
```

This script:
1. Checks the environment configuration
2. Starts the Metro bundler with the custom port
3. Provides instructions for running the Android app

### Kill Metro Process

If you need to kill the Metro bundler process:

```bash
npm run kill-metro
```

## Modifying Environment Variables

To change an environment variable:

1. Open the `.env` file in the project root
2. Modify the desired variable value
3. Save the file
4. Restart the Metro bundler using `npm run start:env`

## Troubleshooting Port Issues

If you encounter port conflicts:

1. Check if the port is in use: `npm run check-env`
2. Kill any existing Metro process: `npm run kill-metro`
3. Change the port in the `.env` file (e.g., `METRO_PORT=8083`)
4. Start the Metro bundler: `npm run start:env`
5. In a new terminal, run the app: `npm run android:env`

## Adding New Environment Variables

To add new environment variables:

1. Add the variable to the `.env` file
2. Update the `src/utils/env.js` file to include the new variable
3. Add a default value for the variable
4. Access the variable through the `env` object in your code
