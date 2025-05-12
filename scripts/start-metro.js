/**
 * Custom Metro Bundler Startup Script
 * 
 * This script starts the Metro bundler with custom port settings from .env file.
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

console.log(`Starting Metro Bundler on port ${metroPort}...`);

// Kill any existing Metro packager process
try {
  const killProcess = spawn('npx', ['react-native', '--kill-packager'], {
    stdio: 'inherit',
    shell: true
  });
  
  killProcess.on('close', (code) => {
    // Start Metro with the custom port
    const startProcess = spawn('npx', ['react-native', 'start', '--port', metroPort], {
      stdio: 'inherit',
      shell: true
    });
    
    startProcess.on('error', (error) => {
      console.error('Failed to start Metro bundler:', error);
      process.exit(1);
    });
  });
} catch (error) {
  console.error('Error killing existing packager:', error);
  process.exit(1);
}
