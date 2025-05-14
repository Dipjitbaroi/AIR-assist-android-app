# AIR-assist Android App Complete Fix Script (PowerShell Version)
Write-Host "===== AIR-assist Android App Complete Fix Script =====" -ForegroundColor Cyan
Write-Host "This script will fix all Gradle and dependency issues." -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Stopping any running processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Write-Host "Step 2: Killing Gradle daemons..." -ForegroundColor Yellow
Set-Location -Path android
if (Test-Path -Path "gradlew.bat") {
    & ".\gradlew.bat" --stop
}
Set-Location -Path ..

Write-Host "Step 3: Clearing Gradle caches..." -ForegroundColor Yellow
$gradleCachePath = Join-Path -Path $env:USERPROFILE -ChildPath ".gradle\caches"
if (Test-Path -Path $gradleCachePath) {
    Remove-Item -Path $gradleCachePath -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "Gradle cache cleared!" -ForegroundColor Green

Write-Host "Step 4: Cleaning node_modules cache..." -ForegroundColor Yellow
if (Test-Path -Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Step 5: Cleaning Android build folders..." -ForegroundColor Yellow
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Step 6: Removing any manually created BuildConfig.java files..." -ForegroundColor Yellow
$buildConfigPath = "android\app\src\main\java\com\airassist\BuildConfig.java"
if (Test-Path -Path $buildConfigPath) {
    Remove-Item -Path $buildConfigPath -Force
    Write-Host "Removed manually created BuildConfig.java" -ForegroundColor Green
}

Write-Host "Step 7: Cleaning specific problematic module build folders..." -ForegroundColor Yellow
$problematicModules = @(
    "node_modules\react-native-screens\android\build",
    "node_modules\react-native-gesture-handler\android\build",
    "node_modules\react-native-safe-area-context\android\build",
    "node_modules\@react-native-community\voice\android\build",
    "node_modules\@react-native-community\slider\android\build",
    "node_modules\react-native-ble-manager\android\build",
    "node_modules\react-native-ble-plx\android\build",
    "node_modules\react-native-fs\android\build",
    "node_modules\react-native-device-info\android\build",
    "node_modules\react-native-background-timer\android\build",
    "node_modules\react-native-audio-record\android\build"
)

foreach ($module in $problematicModules) {
    if (Test-Path -Path $module) {
        Remove-Item -Path $module -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Step 7: Reinstalling node modules with fixed versions..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
npm install

Write-Host "Step 8: Running Gradle wrapper fix script..." -ForegroundColor Yellow
node scripts/fix-gradle.js

Write-Host "Step 9: Killing any processes that might be using the keystore..." -ForegroundColor Yellow
# Try to kill any Java processes that might be using the keystore
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
# Wait a moment for processes to terminate
Start-Sleep -Seconds 2

Write-Host "Step 10: Recreating debug keystore..." -ForegroundColor Yellow
Set-Location -Path "android\app"
$keystorePath = "debug.keystore"
if (Test-Path -Path $keystorePath) {
    try {
        # Try to delete the file
        Remove-Item -Path $keystorePath -Force -ErrorAction Stop
        Write-Host "Deleted existing debug.keystore" -ForegroundColor Green
    }
    catch {
        Write-Host "Could not delete the keystore file: $_" -ForegroundColor Yellow
        Write-Host "Trying alternative method..." -ForegroundColor Yellow
        
        # Try to rename the file first, then delete it
        $tempPath = "debug.keystore.old"
        try {
            Rename-Item -Path $keystorePath -NewName $tempPath -Force -ErrorAction Stop
            Remove-Item -Path $tempPath -Force -ErrorAction SilentlyContinue
            Write-Host "Successfully removed the keystore using rename method" -ForegroundColor Green
        }
        catch {
            Write-Host "Warning: Could not remove the existing keystore. Will try to overwrite it." -ForegroundColor Yellow
        }
    }
}

Write-Host "Generating new debug keystore..." -ForegroundColor Green
try {
    # Specify the keystore type as PKCS12 which is the default for newer Java versions
    & keytool -genkeypair -v -storetype PKCS12 -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed with PKCS12 format. Trying JKS format..." -ForegroundColor Yellow
        & keytool -genkeypair -v -storetype JKS -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to generate debug.keystore. Make sure Java is installed and in your PATH." -ForegroundColor Red
            Write-Host "You may need to manually create the debug.keystore file." -ForegroundColor Red
            exit 1
        }
    }
}
catch {
    Write-Host "Error generating keystore: $_" -ForegroundColor Red
    Write-Host "You may need to manually create the debug.keystore file." -ForegroundColor Red
    exit 1
}
Set-Location -Path "..\..\"

Write-Host "Step 10: Creating local.properties if needed..." -ForegroundColor Yellow
if (-not (Test-Path -Path "android\local.properties")) {
    if ($env:ANDROID_HOME) {
        Set-Content -Path "android\local.properties" -Value "sdk.dir=$($env:ANDROID_HOME -replace '\\', '\\')"
    }
    else {
        $localAppData = $env:LOCALAPPDATA -replace '\\', '\\'
        Set-Content -Path "android\local.properties" -Value "sdk.dir=$localAppData\\Android\\Sdk"
    }
}

Write-Host "Step 11: Rebuilding the project..." -ForegroundColor Yellow
Set-Location -Path android
if (Test-Path -Path "gradlew.bat") {
    Write-Host "Building using gradlew..." -ForegroundColor Green
    & ".\gradlew.bat" --refresh-dependencies
}
Set-Location -Path ..

Write-Host ""
Write-Host "===== Fix completed! =====" -ForegroundColor Green
Write-Host ""
Write-Host "You can now try running the app with:" -ForegroundColor Cyan
Write-Host "npm run android" -ForegroundColor White
Write-Host ""
Write-Host "If you still have issues, try:" -ForegroundColor Yellow
Write-Host "1. Restart your computer and try again" -ForegroundColor White
Write-Host "2. Make sure your Android device is connected and USB debugging is enabled" -ForegroundColor White
Write-Host "3. Check the logs for specific error messages" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
