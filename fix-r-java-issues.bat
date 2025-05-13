@echo off
echo ===== Fixing R.java Generation Issues =====

echo This script will fix the R.java generation issues for native modules.
echo.
echo NOTE: If running in PowerShell, you must use '.\fix-r-java-issues.bat' instead of 'fix-r-java-issues.bat'
echo.

echo Stopping any running Metro bundler...
taskkill /f /im node.exe >nul 2>&1

echo Killing Gradle daemons...
cd android
if exist gradlew.bat (
  call gradlew.bat --stop
)
cd ..

echo Cleaning specific problematic build folders...

echo Cleaning @react-native-async-storage/async-storage build...
rmdir /S /Q node_modules\@react-native-async-storage\async-storage\android\build 2>nul

echo Cleaning @react-native-community/voice build...
rmdir /S /Q node_modules\@react-native-community\voice\android\build 2>nul

echo Cleaning @react-native-community/slider build...
rmdir /S /Q node_modules\@react-native-community\slider\android\build 2>nul

echo Cleaning react-native-ble-manager build...
rmdir /S /Q node_modules\react-native-ble-manager\android\build 2>nul

echo Cleaning react-native-ble-plx build...
rmdir /S /Q node_modules\react-native-ble-plx\android\build 2>nul

echo Cleaning react-native-fs build...
rmdir /S /Q node_modules\react-native-fs\android\build 2>nul

echo Cleaning react-native-device-info build...
rmdir /S /Q node_modules\react-native-device-info\android\build 2>nul

echo Cleaning react-native-background-timer build...
rmdir /S /Q node_modules\react-native-background-timer\android\build 2>nul

echo Cleaning react-native-audio-record build...
rmdir /S /Q node_modules\react-native-audio-record\android\build 2>nul

echo Cleaning main app build folder...
rmdir /S /Q android\app\build 2>nul

echo Creating temporary build.gradle backup...
copy android\app\build.gradle android\app\build.gradle.bak >nul

echo Temporarily modifying build.gradle to prioritize R.java generation...
cd android
if exist gradlew.bat (
  echo Running special Gradle task to generate R.java files...
  call gradlew.bat generateDebugRFile --info
)
cd ..

echo Restoring original build.gradle...
copy android\app\build.gradle.bak android\app\build.gradle >nul
del android\app\build.gradle.bak >nul

echo.
echo ===== R.java fix completed! =====
echo.
echo Now run the comprehensive fix script:
echo fix-all-gradle-issues.bat
echo.
echo Then try running the app with:
echo npm run android
echo.
pause
