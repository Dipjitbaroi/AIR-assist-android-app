@echo off
echo ===== Creating Debug Keystore =====

cd android\app

if exist debug.keystore (
    echo Debug keystore already exists.
) else (
    echo Generating debug keystore...
    keytool -genkeypair -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create debug.keystore.
        echo This might be because keytool command is not available.
        echo Make sure Java is properly installed and in your PATH.
        
        echo Creating empty keystore file as a fallback...
        echo This is not ideal but might work for debug builds.
        echo dummy > debug.keystore
    ) else (
        echo Debug keystore created successfully.
    )
)

cd ..\..

echo Done!
pause
