/**
 * Custom Android Run Script
 * 
 * This script runs the Android app with custom port settings from .env file.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
const env = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

// Get Metro port from .env or use default 8081
const metroPort = env.METRO_PORT || '8082';

console.log(`Running Android app with Metro port ${metroPort}...`);

// Run the Android app with the custom port
const runProcess = spawn('npx', ['react-native', 'run-android', '--port', metroPort], {
  stdio: 'inherit',
  shell: true
});

runProcess.on('error', (error) => {
  console.error('Failed to run Android app:', error);
  process.exit(1);
});
