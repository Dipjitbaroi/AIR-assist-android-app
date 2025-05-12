@echo off
echo ===== Setting up Android Environment =====

echo Checking Java installation...
where java
if %ERRORLEVEL% NEQ 0 (
    echo Java not found! Please ensure Java 17 is installed and environment variables are set.
    echo JAVA_HOME should point to your JDK installation.
    echo PATH should include %%JAVA_HOME%%\bin
    pause
    exit /b
)

echo Java is installed. Version:
java -version

echo.
echo Setting up Gradle wrapper...
cd android
if not exist gradlew.bat (
    echo Downloading Gradle wrapper files...
    curl -o gradle\wrapper\gradle-wrapper.jar https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar --create-dirs
    
    echo Creating wrapper properties file...
    echo distributionBase=GRADLE_USER_HOME > gradle\wrapper\gradle-wrapper.properties
    echo distributionPath=wrapper/dists >> gradle\wrapper\gradle-wrapper.properties
    echo distributionUrl=https\://services.gradle.org/distributions/gradle-7.5.1-bin.zip >> gradle\wrapper\gradle-wrapper.properties
    echo zipStoreBase=GRADLE_USER_HOME >> gradle\wrapper\gradle-wrapper.properties
    echo zipStorePath=wrapper/dists >> gradle\wrapper\gradle-wrapper.properties
    
    echo Creating gradlew.bat...
    echo @rem >> gradlew.bat
    echo @rem Gradle startup script for Windows >> gradlew.bat
    echo @rem >> gradlew.bat
    echo @if "%%DEBUG%%" == "" @echo off >> gradlew.bat
    echo @rem Set local scope for the variables with windows NT shell >> gradlew.bat
    echo if "%%OS%%"=="Windows_NT" setlocal >> gradlew.bat
    echo. >> gradlew.bat
    echo set DIRNAME=%%~dp0 >> gradlew.bat
    echo if "%%DIRNAME%%" == "" set DIRNAME=. >> gradlew.bat
    echo set APP_BASE_NAME=%%~n0 >> gradlew.bat
    echo set APP_HOME=%%DIRNAME%% >> gradlew.bat
    echo. >> gradlew.bat
    echo @rem Add default JVM options here >> gradlew.bat
    echo set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m" >> gradlew.bat
    echo. >> gradlew.bat
    echo @rem Find java.exe >> gradlew.bat
    echo if defined JAVA_HOME goto findJavaFromJavaHome >> gradlew.bat
    echo. >> gradlew.bat
    echo set JAVA_EXE=java.exe >> gradlew.bat
    echo %%JAVA_EXE%% -version >NUL 2^>^&1 >> gradlew.bat
    echo if "%%ERRORLEVEL%%" == "0" goto execute >> gradlew.bat
    echo. >> gradlew.bat
    echo echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH. >> gradlew.bat
    echo echo Please set the JAVA_HOME variable to match the location of your Java installation. >> gradlew.bat
    echo goto fail >> gradlew.bat
    echo. >> gradlew.bat
    echo :findJavaFromJavaHome >> gradlew.bat
    echo set JAVA_HOME=%%JAVA_HOME:"=%% >> gradlew.bat
    echo set JAVA_EXE=%%JAVA_HOME%%/bin/java.exe >> gradlew.bat
    echo. >> gradlew.bat
    echo if exist "%%JAVA_EXE%%" goto execute >> gradlew.bat
    echo. >> gradlew.bat
    echo echo ERROR: JAVA_HOME is set to an invalid directory: %%JAVA_HOME%% >> gradlew.bat
    echo echo Please set the JAVA_HOME variable to match the location of your Java installation. >> gradlew.bat
    echo goto fail >> gradlew.bat
    echo. >> gradlew.bat
    echo :execute >> gradlew.bat
    echo @rem Setup the command line >> gradlew.bat
    echo. >> gradlew.bat
    echo set CLASSPATH=%%APP_HOME%%\gradle\wrapper\gradle-wrapper.jar >> gradlew.bat
    echo. >> gradlew.bat
    echo @rem Execute Gradle >> gradlew.bat
    echo "%%JAVA_EXE%%" %%DEFAULT_JVM_OPTS%% %%JAVA_OPTS%% %%GRADLE_OPTS%% "-Dorg.gradle.appname=%%APP_BASE_NAME%%" -classpath "%%CLASSPATH%%" org.gradle.wrapper.GradleWrapperMain %%* >> gradlew.bat
    echo. >> gradlew.bat
    echo :end >> gradlew.bat
    echo @rem End local scope for the variables with windows NT shell >> gradlew.bat
    echo if "%%ERRORLEVEL%%"=="0" goto mainEnd >> gradlew.bat
    echo. >> gradlew.bat
    echo :fail >> gradlew.bat
    echo rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of >> gradlew.bat
    echo rem the _cmd.exe /c_ return code! >> gradlew.bat
    echo if  not "" == "%%GRADLE_EXIT_CONSOLE%%" exit 1 >> gradlew.bat
    echo exit /b 1 >> gradlew.bat
    echo. >> gradlew.bat
    echo :mainEnd >> gradlew.bat
    echo if "%%OS%%"=="Windows_NT" endlocal >> gradlew.bat
    echo. >> gradlew.bat
    echo :omega >> gradlew.bat
)

echo Verifying gradle wrapper...
if exist gradlew.bat (
    echo Gradle wrapper is installed.
) else (
    echo Failed to create gradlew.bat file.
    pause
    exit /b
)

cd ..

echo Checking if local.properties exists...
if not exist android\local.properties (
    echo Creating local.properties file...
    echo sdk.dir=%LOCALAPPDATA%\Android\Sdk > android\local.properties
    echo Created local.properties pointing to %LOCALAPPDATA%\Android\Sdk
)

echo.
echo Setup complete! Ready to run the app:
echo npm start
echo In a separate terminal: npm run android
pause
