@echo off
setlocal enabledelayedexpansion

rem ===================================================
rem         ADB Device Backup & Restore Tool
rem ===================================================

:main_menu
cls
echo ===============================================
echo         ADB Backup and Restore Tool
echo ===============================================
echo.
echo 1. Backup /sdcard/ to PC
echo 2. Restore /sdcard/ from PC
echo 3. Exit
echo.
set /p choice=Select an option (1-3): 

if "%choice%"=="1" goto backup
if "%choice%"=="2" goto res
if "%choice%"=="3" goto end
echo Invalid choice. Please try again.
pause
goto main_menu

:backup
cls
echo ==============================================
echo                Backup Mode
echo ==============================================
echo.
echo Checking device connection...
adb devices -l
echo.
set /p proceed=Does your device show above? (Y/N): 
if /i not "%proceed%"=="Y" (
  echo Please connect device and enable USB debugging.
  pause
  goto main_menu
)

rem Check if enabledelayedexpansion is active
if not defined CMDCMDLINE (
    echo Error: Delayed expansion not enabled.
    pause
    goto main_menu
)

rem Set default backup directory
set "default_directory=%USERPROFILE%\Desktop\sdcard_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%"

echo.
echo Default backup directory:
echo !default_directory!
echo.
set /p use_default=Use this directory? (Y/N): 

if /i "%use_default%"=="Y" (
    set "local_directory=!default_directory!"
) else (
    set /p local_directory=Enter full path for backup (with quotes if spaces): 
    if not defined local_directory (
        echo No directory specified. Using default.
        set "local_directory=!default_directory!"
    )
)

rem Remove quotes if present
set local_directory=!local_directory:"=!

echo.
echo Creating backup directory...
mkdir "!local_directory!" 2>nul

if not exist "!local_directory!" (
    echo Error: Could not create directory.
    pause
    goto main_menu
)

echo Directory ready: !local_directory!
echo.
echo Starting backup...
echo This may take several minutes depending on data size.
echo.

rem Pull main folders
echo Pulling main folders from /sdcard/...
pushd "!local_directory!"

adb pull -a /sdcard/DCIM DCIM\ 2>nul
adb pull -a /sdcard/Pictures Pictures\ 2>nul
adb pull -a /sdcard/Download Download\ 2>nul
adb pull -a /sdcard/Documents Documents\ 2>nul
adb pull -a /sdcard/Music Music\ 2>nul
adb pull -a /sdcard/Movies Movies\ 2>nul
adb pull -a /sdcard/Audiobooks Audiobooks\ 2>nul
adb pull -a /sdcard/Podcasts Podcasts\ 2>nul
adb pull -a /sdcard/Ringtones Ringtones\ 2>nul
adb pull -a /sdcard/Alarms Alarms\ 2>nul
adb pull -a /sdcard/Notifications Notifications\ 2>nul
adb pull -a /sdcard/Screenshots Screenshots\ 2>nul
adb pull -a /sdcard/Recordings Recordings\ 2>nul

rem Initialize failure tracking
set WHATSAPP_FAILED=0
set WHATSAPP_BUSINESS_FAILED=0
set BCR_FAILED=0

echo Pulling WhatsApp media (if present)...
pushd "!local_directory!"
mkdir "Android\media" 2>nul
pushd "Android\media"
adb pull -a /sdcard/Android/media/com.whatsapp/ 2>nul 1>nul
if errorlevel 1 set WHATSAPP_FAILED=1
adb pull -a /sdcard/Android/media/com.whatsapp.w4b/ 2>nul 1>nul
if errorlevel 1 set WHATSAPP_BUSINESS_FAILED=1
popd
mkdir "Recordings" 2>nul
pushd "Recordings"
adb pull -a /sdcard/Android/data/com.chiller3.bcr/files 2>nul 1>nul
if errorlevel 1 set BCR_FAILED=1
popd
popd

echo.
echo ============================================
echo          Backup Summary
echo ============================================
echo.
echo Main folders: Completed
if !WHATSAPP_FAILED!==1 (
    echo WhatsApp: FAILED (not found or access denied)
) else (
    echo WhatsApp: Completed
)
if !WHATSAPP_BUSINESS_FAILED!==1 (
    echo WhatsApp Business: FAILED (not found or access denied)
) else (
    echo WhatsApp Business: Completed
)
if !BCR_FAILED!==1 (
    echo BCR Call Recordings: FAILED (not found or access denied)
) else (
    echo BCR Call Recordings: Completed
)
echo.
echo ============================================
echo.
pause
goto main_menu

:res
cls
echo ==============================================
echo                Restore Mode
echo ==============================================
echo.
echo Current directory: %CD%
set /p is_correct_dir=Is this the directory containing your /sdcard/ backup? (Y/N): 
if /i "%is_correct_dir%"=="Y" goto restore
set /p restoredir=Enter full path to your backup of /sdcard/ (with quotes if spaces): 
if not exist %restoredir% (
  echo Path not found. Please check and try again.
  pause
  goto res
)
pushd %restoredir%
echo Now in: %CD%
set /p proceed_dir=Use this directory for restore? (Y/N): 
if /i not "%proceed_dir%"=="Y" (
  popd
  goto res
)
goto restore

:restore
cls
echo The following items will be pushed to /sdcard/ on device:
dir /b
echo.
set /p confirm_restore=Press Y to restore, any other key to cancel: 
if /i not "%confirm_restore%"=="Y" (
  echo Restore cancelled.
  if defined restoredir popd
  pause
  goto main_menu
)
echo Restoring...
adb push . /sdcard/ 2>nul
if defined restoredir popd
echo Done.
pause
goto main_menu

:end
echo Exiting...
endlocal
exit /b 0
