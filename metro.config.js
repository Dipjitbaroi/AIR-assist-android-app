/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * This configuration includes custom port settings from .env file.
 *
 * @format
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
const env = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

// Get Metro port from .env or use default 8081
const metroPort = parseInt(env.METRO_PORT || '8081', 10);

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  server: {
    port: metroPort
  }
};
