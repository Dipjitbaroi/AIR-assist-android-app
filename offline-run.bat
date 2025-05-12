@echo off
echo ===== Running Android App in Offline Mode =====

echo Using Java 17...
if defined JAVA_HOME (
  echo JAVA_HOME is set to: %JAVA_HOME%
) else (
  echo JAVA_HOME is not set. Setting to JDK 17...
  set JAVA_HOME=C:\Program Files\Java\jdk-17
)

echo Starting Metro bundler in a new window...
start cmd /k "title Metro Bundler && npm start"

echo Waiting for Metro to start...
timeout /t 10

echo Running Android app in offline mode...
cd android
if exist gradlew.bat (
  call gradlew.bat --offline app:installDebug
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to build in offline mode.
    echo Trying with regular mode...
    call gradlew.bat app:installDebug
  )
) else (
  echo gradlew.bat not found. Try running setup-android.bat first.
  exit /b 1
)

cd ..

echo App installed! Running...
adb shell am start -n com.airassist/com.airassist.MainActivity

echo Done! The app should now be running on your device.
