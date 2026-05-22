@echo off
REM Sync Screenshots from Downloads to Network Drive
REM Enhanced error logging

setlocal enabledelayedexpansion

set "SOURCE_DIR=%USERPROFILE%\Downloads\VIF_screenshots"
set "TARGET_DIR=%USERPROFILE%\OneDrive - Kantar\Sachindra Nain (external)'s files - TRAI Data Adequacy"
set "LOG_FILE=%USERPROFILE%\Downloads\screenshot_sync_log.txt"

REM Initialize log
(
    echo.
    echo ========== Sync Started: %date% %time% ==========
    echo Source: %SOURCE_DIR%
    echo Target: %TARGET_DIR%
) >> "%LOG_FILE%"

echo.
echo ========== SCREENSHOT SYNC ==========
echo Source: %SOURCE_DIR%
echo Target: %TARGET_DIR%
echo Log: %LOG_FILE%
echo.

REM Check if source folder exists
if not exist "%SOURCE_DIR%" (
    (
        echo [ERROR] Source folder NOT FOUND: %SOURCE_DIR%
    ) >> "%LOG_FILE%"
    echo [ERROR] Source folder not found: %SOURCE_DIR%
    pause
    exit /b 1
)

echo [OK] Source folder found
(echo [OK] Source folder found: %SOURCE_DIR%) >> "%LOG_FILE%"

REM List files to sync
setlocal enabledelayedexpansion
set FILE_COUNT=0

for /r "%SOURCE_DIR%" %%F in (*.png) do (
    set /a FILE_COUNT+=1
)

echo Found !FILE_COUNT! PNG files to sync
(echo [INFO] Found !FILE_COUNT! PNG files to sync) >> "%LOG_FILE%"

if !FILE_COUNT! equ 0 (
    (echo [INFO] No PNG files found in source. Nothing to sync.) >> "%LOG_FILE%"
    echo No PNG files found to sync.
    pause
    exit /b 0
)

REM Check if target folder is accessible
echo.
echo Checking target path...
if not exist "%TARGET_DIR%" (
    (echo [ERROR] Target path NOT FOUND: %TARGET_DIR%) >> "%LOG_FILE%"
    echo [ERROR] Target path does not exist or not accessible.
    echo Attempting to create: %TARGET_DIR%

    mkdir "%TARGET_DIR%" 2>nul

    if errorlevel 1 (
        (echo [ERROR] FAILED to create target path) >> "%LOG_FILE%"
        echo [ERROR] Could not create target path. Check:
        echo  - Network drive is connected (S: or mapped path)
        echo  - You have write permissions
        echo  - Path is correct: %TARGET_DIR%
        (echo [ERROR] Error level: !errorlevel!) >> "%LOG_FILE%"
        pause
        exit /b 1
    )
    echo [OK] Target path created successfully
    (echo [OK] Target path created) >> "%LOG_FILE%"
) else (
    echo [OK] Target path is accessible
    (echo [OK] Target path accessible) >> "%LOG_FILE%"
)

REM Copy all screenshots
echo.
echo Starting sync...
(echo [INFO] Starting file sync...) >> "%LOG_FILE%"

set COPY_COUNT=0
set SKIP_COUNT=0
set ERROR_COUNT=0

for /r "%SOURCE_DIR%" %%F in (*.png) do (
    set "FILE=%%F"
    set "FILENAME=%%~nxF"
    set "RELATIVE=!FILE:%SOURCE_DIR%=!"
    set "DESTINATION=%TARGET_DIR%!RELATIVE!"
    set "DEST_FOLDER=!DESTINATION:\!FILENAME!=!"

    REM Create destination directory if needed
    if not exist "!DEST_FOLDER!" (
        mkdir "!DEST_FOLDER!" 2>nul
        if errorlevel 1 (
            (echo [ERROR] Cannot create folder: !DEST_FOLDER!) >> "%LOG_FILE%"
            set /a ERROR_COUNT+=1
            echo [ERROR] Failed to create: !DEST_FOLDER!
            goto skip_file
        )
    )

    REM Check if already exists
    if exist "!DESTINATION!" (
        (echo [SKIP] Already exists: !FILENAME!) >> "%LOG_FILE%"
        set /a SKIP_COUNT+=1
        goto skip_file
    )

    REM Copy file
    copy "!FILE!" "!DESTINATION!" >nul 2>&1
    if errorlevel 1 (
        (echo [ERROR] Failed to copy: !FILENAME! from !FILE! to !DESTINATION!) >> "%LOG_FILE%"
        set /a ERROR_COUNT+=1
        echo [ERROR] Copy failed: !FILENAME!
    ) else (
        (echo [OK] Copied: !FILENAME!) >> "%LOG_FILE%"
        set /a COPY_COUNT+=1
        echo [OK] Copied: !FILENAME!
    )

    :skip_file
)

REM Summary
echo.
echo ============ SYNC COMPLETE ============
echo Copied: !COPY_COUNT! files
echo Skipped: !SKIP_COUNT! files (already exist)
echo Errors: !ERROR_COUNT! files
echo.
echo Log file: %LOG_FILE%
echo.

(
    echo [SUMMARY] Copied: !COPY_COUNT!, Skipped: !SKIP_COUNT!, Errors: !ERROR_COUNT!
    echo ========== Sync Completed: %date% %time% ==========
) >> "%LOG_FILE%"

pause
