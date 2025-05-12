/**
 * Environment Configuration Check Script
 * 
 * This script displays the current environment configuration settings.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
const env = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

// Default values
const defaults = {
  METRO_PORT: '8081',
  WEBSOCKET_URL: 'wss://api.airassist.io/ws',
  APP_NAME: 'AIRAssist',
  APP_VERSION: '1.0.0',
  DEBUG_MODE: process.env.NODE_ENV === 'development' ? 'true' : 'false',
};

// Get values with fallbacks to defaults
const metroPort = env.METRO_PORT || defaults.METRO_PORT;
const websocketUrl = env.WEBSOCKET_URL || defaults.WEBSOCKET_URL;
const appName = env.APP_NAME || defaults.APP_NAME;
const appVersion = env.APP_VERSION || defaults.APP_VERSION;
const debugMode = env.DEBUG_MODE || defaults.DEBUG_MODE;

// Display the configuration
console.log('\n=== Environment Configuration ===\n');
console.log(`Metro Port:      ${metroPort}`);
console.log(`WebSocket URL:   ${websocketUrl}`);
console.log(`App Name:        ${appName}`);
console.log(`App Version:     ${appVersion}`);
console.log(`Debug Mode:      ${debugMode}`);
console.log('\n=================================\n');

// Check for port availability
const net = require('net');
const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${metroPort} is currently in use!`);
    console.log('   You should either change the port in .env file or kill the process using it.');
    console.log('   To kill the process, run: npm run kill-metro\n');
  } else {
    console.error(`Error checking port: ${err.message}`);
  }
});

server.once('listening', () => {
  console.log(`✅ Port ${metroPort} is available and ready to use.\n`);
  server.close();
});

server.listen(metroPort);
