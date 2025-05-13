@echo off
echo ===== AIR-assist Android App Fix and Run Script =====
echo This script will fix all Gradle issues and run the app.
echo.
echo NOTE: If running in PowerShell, you must use '.\fix-and-run-app.bat' instead of 'fix-and-run-app.bat'
echo.

echo Step 1: Fixing R.java generation issues...
call .\fix-r-java-issues.bat

echo Step 2: Applying comprehensive Gradle fixes...
call .\fix-all-gradle-issues.bat

echo Step 3: Running the app...
echo Starting Metro bundler in a new window...
start cmd /k "title Metro Bundler && npm start"

echo Waiting for Metro to start...
timeout /t 10

echo Building and running the Android app...
npm run android

echo.
echo If the app doesn't start automatically, check the console for errors.
echo See GRADLE_FIX_README.md for troubleshooting tips.
echo.
pause
