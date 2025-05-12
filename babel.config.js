/**
 * Babel Configuration
 * 
 * This file configures Babel for the React Native project, including
 * support for environment variables through react-native-dotenv.
 *
 * @version 1.0.0
 */

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ["module:react-native-dotenv", {
      "moduleName": "@env",
      "path": ".env",
      "blacklist": null,
      "whitelist": null,
      "safe": false,
      "allowUndefined": true
    }]
  ]
};
