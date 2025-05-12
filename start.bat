@echo off
echo ===== AIR-assist Application Launcher =====

echo Checking environment configuration...
node scripts/check-env.js

echo.
echo Starting Metro bundler with custom port...
npm run start:env

echo.
echo Metro started! In a new terminal window, run the Android app with:
echo npm run android:env
