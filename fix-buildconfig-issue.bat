@echo off
echo ===== Fixing BuildConfig Duplicate Class Issue =====
echo.

echo Step 1: Stopping any running processes...
taskkill /f /im node.exe >nul 2>&1

echo Step 2: Killing Gradle daemons...
cd android
if exist gradlew.bat (
  call gradlew.bat --stop
)
cd ..

echo Step 3: Cleaning build directories...
rmdir /S /Q android\app\build 2>nul
rmdir /S /Q android\.gradle 2>nul
rmdir /S /Q android\build 2>nul

echo Step 4: Removing any manually created BuildConfig.java files...
if exist android\app\src\main\java\com\airassist\BuildConfig.java (
  del android\app\src\main\java\com\airassist\BuildConfig.java
  echo Removed manually created BuildConfig.java
)

echo Step 5: Cleaning Gradle cache...
rmdir /S /Q "%USERPROFILE%\.gradle\caches\modules-2\files-2.1\com.facebook" 2>nul
echo Gradle cache cleaned!

echo Step 6: Rebuilding the project...
cd android
if exist gradlew.bat (
  echo Building using gradlew...
  call gradlew.bat clean
)
cd ..

echo.
echo ===== Fix completed! =====
echo.
echo You can now try running the app with:
echo npm run android
echo.
pause
