# AIR-assist Android App BuildConfig Fix Script (PowerShell Version)
Write-Host "===== Fixing BuildConfig Duplicate Class Issue =====" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Stopping any running processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Write-Host "Step 2: Killing Gradle daemons..." -ForegroundColor Yellow
Set-Location -Path android
if (Test-Path -Path "gradlew.bat") {
    & ".\gradlew.bat" --stop
}
Set-Location -Path ..

Write-Host "Step 3: Cleaning build directories..." -ForegroundColor Yellow
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Step 4: Removing any manually created BuildConfig.java files..." -ForegroundColor Yellow
$buildConfigPath = "android\app\src\main\java\com\airassist\BuildConfig.java"
if (Test-Path -Path $buildConfigPath) {
    Remove-Item -Path $buildConfigPath -Force
    Write-Host "Removed manually created BuildConfig.java" -ForegroundColor Green
}

Write-Host "Step 5: Cleaning Gradle cache..." -ForegroundColor Yellow
$gradleCachePath = Join-Path -Path $env:USERPROFILE -ChildPath ".gradle\caches\modules-2\files-2.1\com.facebook"
if (Test-Path -Path $gradleCachePath) {
    Remove-Item -Path $gradleCachePath -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "Gradle cache cleaned!" -ForegroundColor Green

Write-Host "Step 6: Rebuilding the project..." -ForegroundColor Yellow
Set-Location -Path android
if (Test-Path -Path "gradlew.bat") {
    Write-Host "Building using gradlew..." -ForegroundColor Green
    & ".\gradlew.bat" clean
}
Set-Location -Path ..

Write-Host ""
Write-Host "===== Fix completed! =====" -ForegroundColor Green
Write-Host ""
Write-Host "You can now try running the app with:" -ForegroundColor Cyan
Write-Host "npm run android" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
