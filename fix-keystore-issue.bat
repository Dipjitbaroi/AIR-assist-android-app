@echo off
echo ===== Fixing Debug Keystore Issue =====
echo.

echo Step 1: Stopping any running processes...
taskkill /f /im node.exe >nul 2>&1

echo Step 2: Killing Gradle daemons...
cd android
if exist gradlew.bat (
  call gradlew.bat --stop
)
cd ..

echo Step 3: Killing any processes that might be using the keystore...
taskkill /f /im java.exe >nul 2>&1
rem Wait a moment for processes to terminate
timeout /t 2 >nul

echo Step 4: Deleting existing debug.keystore...
if exist android\app\debug.keystore (
  del /f android\app\debug.keystore 2>nul
  if exist android\app\debug.keystore (
    echo Could not delete the keystore file. Trying alternative method...
    ren android\app\debug.keystore debug.keystore.old 2>nul
    del /f android\app\debug.keystore.old 2>nul
    echo Attempted to remove keystore using rename method
  ) else (
    echo Deleted existing debug.keystore
  )
)

echo Step 5: Creating new debug.keystore...
cd android\app
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

echo Step 5: Cleaning build directories...
rmdir /S /Q android\app\build 2>nul
rmdir /S /Q android\.gradle 2>nul
rmdir /S /Q android\build 2>nul

echo Step 6: Rebuilding the project...
cd android
if exist gradlew.bat (
  echo Building using gradlew...
  call gradlew.bat clean
)
cd ..

echo.
echo ===== Debug Keystore Fix completed! =====
echo.
echo You can now try running the app with:
echo npm run android
echo.
pause
