@echo off
echo ===== AIR-assist Android App Complete Fix Script =====
echo This script will fix all Gradle and dependency issues.
echo.
echo NOTE: If running in PowerShell, you must use '.\fix-all-issues.bat' instead of 'fix-all-issues.bat'
echo.

echo Step 1: Stopping any running processes...
taskkill /f /im node.exe >nul 2>&1

echo Step 2: Killing Gradle daemons...
cd android
if exist gradlew.bat (
  call gradlew.bat --stop
)
cd ..

echo Step 3: Clearing Gradle caches...
rmdir /S /Q "%USERPROFILE%\.gradle\caches" 2>nul
echo Gradle cache cleared!

echo Step 4: Cleaning node_modules cache...
rmdir /S /Q node_modules\.cache 2>nul

echo Step 5: Cleaning Android build folders...
rmdir /S /Q android\app\build 2>nul
rmdir /S /Q android\.gradle 2>nul
rmdir /S /Q android\build 2>nul

echo Step 6: Removing any manually created BuildConfig.java files...
if exist android\app\src\main\java\com\airassist\BuildConfig.java (
  del android\app\src\main\java\com\airassist\BuildConfig.java
  echo Removed manually created BuildConfig.java
)

echo Step 7: Cleaning specific problematic module build folders...
rmdir /S /Q node_modules\react-native-screens\android\build 2>nul
rmdir /S /Q node_modules\react-native-gesture-handler\android\build 2>nul
rmdir /S /Q node_modules\react-native-safe-area-context\android\build 2>nul
rmdir /S /Q node_modules\@react-native-community\voice\android\build 2>nul
rmdir /S /Q node_modules\@react-native-community\slider\android\build 2>nul
rmdir /S /Q node_modules\react-native-ble-manager\android\build 2>nul
rmdir /S /Q node_modules\react-native-ble-plx\android\build 2>nul
rmdir /S /Q node_modules\react-native-fs\android\build 2>nul
rmdir /S /Q node_modules\react-native-device-info\android\build 2>nul
rmdir /S /Q node_modules\react-native-background-timer\android\build 2>nul
rmdir /S /Q node_modules\react-native-audio-record\android\build 2>nul

echo Step 7: Reinstalling node modules with fixed versions...
echo This may take a few minutes...
call npm install

echo Step 8: Running Gradle wrapper fix script...
node scripts/fix-gradle.js

echo Step 9: Killing any processes that might be using the keystore...
taskkill /f /im java.exe >nul 2>&1
rem Wait a moment for processes to terminate
timeout /t 2 >nul

echo Step 10: Recreating debug keystore...
cd android\app
if exist debug.keystore (
  del /f debug.keystore 2>nul
  if exist debug.keystore (
    echo Could not delete the keystore file. Trying alternative method...
    ren debug.keystore debug.keystore.old 2>nul
    del /f debug.keystore.old 2>nul
    echo Attempted to remove keystore using rename method
  ) else (
    echo Deleted existing debug.keystore
  )
)
echo Generating new debug keystore with PKCS12 format...
keytool -genkeypair -v -storetype PKCS12 -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
if %ERRORLEVEL% NEQ 0 (
  echo Failed with PKCS12 format. Trying JKS format...
  keytool -genkeypair -v -storetype JKS -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to generate debug.keystore. Make sure Java is installed and in your PATH.
    echo You may need to manually create the debug.keystore file.
    exit /b 1
  )
)
cd ..\..

echo Step 10: Creating local.properties if needed...
if not exist android\local.properties (
  echo sdk.dir=%ANDROID_HOME% > android\local.properties
  if %ERRORLEVEL% NEQ 0 (
    echo sdk.dir=%LOCALAPPDATA%\Android\Sdk > android\local.properties
  )
)

echo Step 11: Rebuilding the project...
cd android
if exist gradlew.bat (
  echo Building using gradlew...
  call gradlew.bat --refresh-dependencies
)
cd ..

echo.
echo ===== Fix completed! =====
echo.
echo You can now try running the app with:
echo npm run android
echo.
echo If you still have issues, try:
echo 1. Restart your computer and try again
echo 2. Make sure your Android device is connected and USB debugging is enabled
echo 3. Check the logs for specific error messages
echo.
pause
