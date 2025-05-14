# AIR-assist Android App Gradle Fix Guide

This guide provides instructions for resolving common Gradle build issues in the AIR-assist Android app, particularly focusing on R.java generation failures, Kotlin compilation issues, BuildConfig duplicate class errors, and debug keystore issues that can occur with React Native native modules.

## Common Issues

The most common build errors you might encounter are:

- `Task :react-native-module:generateDebugRFile FAILED` errors
- Kotlin compilation failures (`Task :react-native-screens:compileDebugKotlin FAILED`)
- BuildConfig duplicate class errors (`error: duplicate class: com.airassist.BuildConfig`)
- Debug keystore issues (`Failed to read key androiddebugkey from store`)
- CMake warnings about compiler attributes
- Gradle wrapper issues (`Could not find or load main class org.gradle.wrapper.GradleWrapperMain`)
- Dependency resolution failures
- Java version compatibility issues
- Deprecated Gradle features warnings

## Fix Scripts

We've provided several scripts to help resolve these issues:

### 1. Complete Fix Script (Recommended)

This script addresses all known issues including R.java generation failures, Kotlin compilation errors, and CMake warnings:

**In Command Prompt (cmd):**
```
fix-all-issues.bat
```

**In PowerShell:**
```
.\Fix-All-Issues.ps1
```

This script:
- Cleans build folders for all problematic native modules
- Updates dependency versions to compatible ones
- Fixes Kotlin compilation issues
- Addresses CMake warnings
- Clears Gradle caches
- Fixes Gradle wrapper files
- Creates necessary configuration files
- Cleans and rebuilds the project

### 2. Debug Keystore Fix

This script specifically targets the debug keystore issues:

**In Command Prompt (cmd):**
```
fix-keystore-issue.bat
```

**In PowerShell:**
```
.\Fix-KeystoreIssue.ps1
```

This script:
- Deletes the existing debug.keystore file
- Creates a new valid debug.keystore with the correct keys and passwords
- Cleans build directories
- Rebuilds the project

### 3. BuildConfig Duplicate Class Fix

This script specifically targets the BuildConfig duplicate class error:

**In Command Prompt (cmd):**
```
fix-buildconfig-issue.bat
```

**In PowerShell:**
```
.\Fix-BuildConfigIssue.ps1
```

This script:
- Removes manually created BuildConfig.java files
- Cleans build directories
- Clears Gradle caches
- Rebuilds the project

### 2. Fix R.java Generation Issues

This script specifically targets the R.java generation failures:

**In Command Prompt (cmd):**
```
fix-r-java-issues.bat
```

**In PowerShell:**
```
.\fix-r-java-issues.bat
```

### 3. Comprehensive Gradle Fix

This script performs a thorough cleanup and setup of the Gradle environment:

**In Command Prompt (cmd):**
```
fix-all-gradle-issues.bat
```

**In PowerShell:**
```
.\fix-all-gradle-issues.bat
```

### 4. All-in-One Fix and Run

This script runs the fix scripts in sequence and then launches the app:

**In Command Prompt (cmd):**
```
fix-and-run-app.bat
```

**In PowerShell:**
```
.\Fix-And-Run-App.ps1
```

## What We Fixed

The following changes were made to fix the issues:

1. **Updated Package Dependencies**:
   - Pinned react-native-gesture-handler to version 2.9.0
   - Pinned react-native-safe-area-context to version 4.5.0
   - Pinned react-native-screens to version 3.19.0

2. **Updated Gradle Configuration**:
   - Added Kotlin version specification (1.7.20) to fix compilation issues
   - Added Kotlin Gradle plugin to the dependencies
   - Added configuration to suppress CMake warnings
   - Added properties to avoid Gradle 8.0 deprecation warnings

3. **Created Comprehensive Fix Scripts**:
   - Added scripts to clean problematic module build folders
   - Added scripts to reinstall node modules with fixed versions
   - Added scripts to rebuild the project with the correct configuration

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
.\Fix-All-Issues.ps1
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
