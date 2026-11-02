@echo off
setlocal enableextensions

set "MAVEN_BIN=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6\apache-maven-3.9.6\bin\mvn.cmd"

if exist "%MAVEN_BIN%" (
    "%MAVEN_BIN%" %*
    exit /b %ERRORLEVEL%
) else (
    echo Maven binary not found at %MAVEN_BIN%
    exit /b 1
)
