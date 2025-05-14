# AIR-assist Android App Debug Keystore Fix Script (PowerShell Version)
Write-Host "===== Fixing Debug Keystore Issue =====" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Stopping any running processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Write-Host "Step 2: Killing Gradle daemons..." -ForegroundColor Yellow
Set-Location -Path android
if (Test-Path -Path "gradlew.bat") {
    & ".\gradlew.bat" --stop
}
Set-Location -Path ..

Write-Host "Step 3: Killing any processes that might be using the keystore..." -ForegroundColor Yellow
# Try to kill any Java processes that might be using the keystore
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
# Wait a moment for processes to terminate
Start-Sleep -Seconds 2

Write-Host "Step 4: Deleting existing debug.keystore..." -ForegroundColor Yellow
$keystorePath = "android\app\debug.keystore"
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
        $tempPath = "android\app\debug.keystore.old"
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

Write-Host "Step 5: Creating new debug.keystore..." -ForegroundColor Yellow
Set-Location -Path "android\app"
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

Write-Host "Step 5: Cleaning build directories..." -ForegroundColor Yellow
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Step 6: Rebuilding the project..." -ForegroundColor Yellow
Set-Location -Path android
if (Test-Path -Path "gradlew.bat") {
    Write-Host "Building using gradlew..." -ForegroundColor Green
    & ".\gradlew.bat" clean
}
Set-Location -Path ..

Write-Host ""
Write-Host "===== Debug Keystore Fix completed! =====" -ForegroundColor Green
Write-Host ""
Write-Host "You can now try running the app with:" -ForegroundColor Cyan
Write-Host "npm run android" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
