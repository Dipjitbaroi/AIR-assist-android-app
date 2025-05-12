@echo off
echo ===== Cleaning Build Files =====

echo Stopping Gradle daemon...
cd android
if exist gradlew.bat (
    call gradlew.bat --stop
)
cd ..

echo Cleaning Android build...
cd android
if exist gradlew.bat (
    call gradlew.bat clean
)
cd ..

echo Cleaning Gradle cache...
rmdir /S /Q %USERPROFILE%\.gradle\caches\modules-2\files-2.1\com.facebook.flipper

echo Cleaning React Native cache...
rmdir /S /Q node_modules\.cache

echo Cleaning temporary build files...
rmdir /S /Q android\app\build

echo Build cleaned successfully!
echo.
echo Now run: npm run android
pause
