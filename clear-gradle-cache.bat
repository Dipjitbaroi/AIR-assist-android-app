@echo off
echo ===== Clearing Gradle Cache =====

echo Stopping Gradle Daemon...
gradlew.bat --stop

echo Clearing Gradle cache...
rmdir /S /Q "%USERPROFILE%\.gradle\caches"

echo Cache cleared! Try running the app again with:
echo npm run android
pause
