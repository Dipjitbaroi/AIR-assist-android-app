@echo off
echo ===== Fixing Gradle Wrapper =====

echo Running Gradle fix script...
node scripts/fix-gradle.js

echo.
echo Fix completed! You can now try running the app with:
echo npm run android
