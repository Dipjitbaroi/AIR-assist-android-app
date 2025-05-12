@echo off
echo ===== AIR-assist Android App Fix and Run =====

echo Checking for Java 17...
java -version 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Java not found. Please install JDK 17 and set JAVA_HOME.
  pause
  exit /b 1
)

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

echo Stopping any running Metro bundler...
taskkill /f /im node.exe >nul 2>&1

echo Killing Gradle daemons...
cd android
if exist gradlew.bat (
  call gradlew.bat --stop
)
cd ..

echo Cleaning Gradle build...
cd android
if exist gradlew.bat (
  call gradlew.bat clean
)
cd ..

echo Clearing Gradle caches...
rmdir /S /Q %USERPROFILE%\.gradle\caches\modules-2\files-2.1\com.facebook

echo Clearing Metro bundler cache...
rmdir /S /Q node_modules\.cache

echo Setting up environment for Android run...
set JAVA_HOME=C:\Program Files\Java\jdk-17

echo Starting Metro bundler...
start cmd /k "title Metro Bundler && npm start"

echo Waiting for Metro to start...
timeout /t 10

echo Building and running the Android app...
cd android
if exist gradlew.bat (
  echo Building using gradlew app:installDebug...
  call gradlew.bat app:installDebug
  if %ERRORLEVEL% NEQ 0 (
    echo First build attempt failed.
    echo Trying with the offline mode...
    call gradlew.bat --offline app:installDebug
  )
) else (
  echo gradlew.bat not found!
  echo Running npm command instead...
  cd ..
  npm run android
  exit /b
)
cd ..

echo App installed! Running...
adb shell am start -n com.airassist/com.airassist.MainActivity

echo Done! The app should now be running on your device.
echo.
echo If you still have issues, try:
echo 1. Run 'npm install' to reinstall node modules
echo 2. Make sure your Android device is connected and USB debugging is enabled
echo 3. Restart your computer and try again
pause
