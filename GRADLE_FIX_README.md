# AIR-assist Android App Gradle Fix Guide

This guide provides instructions for resolving common Gradle build issues in the AIR-assist Android app, particularly focusing on R.java generation failures that can occur with React Native native modules.

## Common Issues

The most common build errors you might encounter are:

- `Task :react-native-module:generateDebugRFile FAILED` errors
- Gradle wrapper issues (`Could not find or load main class org.gradle.wrapper.GradleWrapperMain`)
- Dependency resolution failures
- Java version compatibility issues

## Fix Scripts

We've provided several scripts to help resolve these issues:

### 1. Fix R.java Generation Issues

This script specifically targets the R.java generation failures that commonly occur with React Native native modules:

**In Command Prompt (cmd):**
```
fix-r-java-issues.bat
```

**In PowerShell:**
```
.\fix-r-java-issues.bat
```

This script:
- Cleans build folders for problematic native modules
- Runs a special Gradle task to generate R.java files
- Prepares the project for a clean rebuild

### 2. Comprehensive Gradle Fix

This script performs a more thorough cleanup and setup of the Gradle environment:

**In Command Prompt (cmd):**
```
fix-all-gradle-issues.bat
```

**In PowerShell:**
```
.\fix-all-gradle-issues.bat
```

This script:
- Clears Gradle caches
- Fixes Gradle wrapper files
- Creates necessary configuration files
- Cleans and rebuilds the project
- Sets up proper Java environment

## Manual Fix Steps

If the scripts don't resolve your issues, you can try these manual steps:

1. **Clear Gradle Cache**:
   ```
   rmdir /S /Q "%USERPROFILE%\.gradle\caches"
   ```

2. **Clean Android Build Folders**:
   ```
   cd android
   gradlew.bat clean
   cd ..
   rmdir /S /Q android\app\build
   ```

3. **Verify Java 17**:
   Ensure you have Java 17 installed and properly configured.

4. **Reinstall Node Modules**:
   ```
   npm install
   ```

5. **Manually Update Gradle Files**:
   - Check `android/build.gradle` for proper repository configuration
   - Verify `android/settings.gradle` includes all native modules
   - Ensure `android/gradle.properties` has correct settings

### 3. All-in-One Fix and Run

This script runs both fix scripts in sequence and then launches the app:

**In Command Prompt (cmd):**
```
fix-and-run-app.bat
```

**In PowerShell:**
```
.\fix-and-run-app.bat
```

**PowerShell Native Script:**
We've also provided a native PowerShell script that you can run directly:
```
.\Fix-And-Run-App.ps1
```

## Running the App

After fixing the Gradle issues, you can run the app with:

```
npm run android
```

**Note:** If you're using PowerShell, you need to prefix batch files with `.\` to run them from the current directory. For example:
```
.\fix-r-java-issues.bat
```

Alternatively, you can use the native PowerShell script which doesn't require this prefix:
```
.\Fix-And-Run-App.ps1
```

## Troubleshooting

If you still encounter issues:

1. Check that your Android device is connected and USB debugging is enabled
2. Verify that your Android SDK is properly installed and configured
3. Try running with the verbose flag: `npm run android -- --verbose`
4. Check the React Native logs for more detailed error information

## For Team Members

When working on this project:

1. Always use Java 17 for compatibility
2. Don't modify the Gradle configuration files unless necessary
3. If you add new native modules, update the `settings.gradle` file accordingly
4. Run the fix scripts if you encounter build issues

## Contact

If you continue to experience issues, please contact the AIR-assist development team for assistance.
