# AIR-assist Android App Fix and Run Script (PowerShell Version)
Write-Host "===== AIR-assist Android App Fix and Run Script =====" -ForegroundColor Cyan
Write-Host "This script will fix all Gradle issues and run the app." -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Fixing R.java generation issues..." -ForegroundColor Yellow
& "$PSScriptRoot\fix-r-java-issues.bat"

Write-Host "Step 2: Applying comprehensive Gradle fixes..." -ForegroundColor Yellow
& "$PSScriptRoot\fix-all-gradle-issues.bat"

Write-Host "Step 3: Running the app..." -ForegroundColor Yellow
Write-Host "Starting Metro bundler in a new window..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "title Metro Bundler && npm start"

Write-Host "Waiting for Metro to start..." -ForegroundColor Green
Start-Sleep -Seconds 10

Write-Host "Building and running the Android app..." -ForegroundColor Green
npm run android

Write-Host ""
Write-Host "If the app doesn't start automatically, check the console for errors." -ForegroundColor Magenta
Write-Host "See GRADLE_FIX_README.md for troubleshooting tips." -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
