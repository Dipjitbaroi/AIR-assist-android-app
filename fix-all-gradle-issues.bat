@echo off
echo ===== AIR-assist Android App Complete Fix Script =====
echo.
echo NOTE: If running in PowerShell, you must use '.\fix-all-gradle-issues.bat' instead of 'fix-all-gradle-issues.bat'
echo.

echo Checking for Java 17...
java -version 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Java not found. Please install JDK 17.
  pause
  exit /b 1
)

echo Stopping any running Metro bundler...
taskkill /f /im node.exe >nul 2>&1

echo Killing Gradle daemons...
cd android
if exist gradlew.bat (
  call gradlew.bat --stop
)
cd ..

echo Clearing Gradle caches...
rmdir /S /Q "%USERPROFILE%\.gradle\caches" 2>nul
echo Gradle cache cleared!

echo Clearing Metro bundler cache...
rmdir /S /Q node_modules\.cache 2>nul

echo Running Gradle wrapper fix script...
node scripts/fix-gradle.js

echo Creating debug keystore if it doesn't exist...
cd android\app
if not exist debug.keystore (
  echo Generating debug keystore...
  keytool -genkeypair -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
  if %ERRORLEVEL% NEQ 0 (
    echo Creating empty debug.keystore file as fallback...
    echo dummy > debug.keystore
  )
)
cd ..\..

echo Cleaning Android build...
cd android
if exist gradlew.bat (
  call gradlew.bat clean
)
cd ..

echo Cleaning node_modules/.cache...
rmdir /S /Q node_modules\.cache 2>nul

echo Cleaning watchman watches...
watchman watch-del-all 2>nul

echo Cleaning Android build folders...
rmdir /S /Q android\app\build 2>nul
rmdir /S /Q android\.gradle 2>nul
rmdir /S /Q android\build 2>nul

echo Cleaning temp directory...
rmdir /S /Q temp_fix 2>nul
mkdir temp_fix 2>nul

echo Creating local.properties if needed...
if not exist android\local.properties (
  echo sdk.dir=%ANDROID_HOME% > android\local.properties
  if %ERRORLEVEL% NEQ 0 (
    echo sdk.dir=%LOCALAPPDATA%\Android\Sdk > android\local.properties
  )
)

echo Rebuilding the project...
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
echo 1. Run 'npm install' to reinstall node modules
echo 2. Make sure your Android device is connected and USB debugging is enabled
echo 3. Restart your computer and try again
echo.
pause
