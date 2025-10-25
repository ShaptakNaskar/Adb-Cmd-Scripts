@echo off
setlocal EnableDelayedExpansion
title ADB-CMD Backup & Restore - Optimized Connection

:: ==============================================
:: ADB-CMD Scripts - Optimized Connection Flow
:: - Unified USB/Wireless connection menu
:: - Automatic device detection and guidance
:: - Step-by-step wireless pairing and connect
:: - Improved error handling and validation
:: - pushd/popd for directory management
:: ==============================================

:: Ensure output directory exists
if not exist "Pulled" mkdir "Pulled"

:main_menu
cls
echo ==============================================
echo        ADB-CMD Backup & Restore Tool
echo ==============================================
echo.
echo 1) Connect device (USB or Wireless)
echo 2) Backup from device to PC
echo 3) Restore from PC to device
echo 4) Exit
echo.
set /p menu_choice=Select an option [1-4]: 
if "%menu_choice%"=="1" goto connect_menu
if "%menu_choice%"=="2" goto verify_connected_for_backup
if "%menu_choice%"=="3" goto verify_connected_for_restore
if "%menu_choice%"=="4" goto end
echo Invalid choice. Please select 1-4.
pause
goto main_menu

:: ==============================================
:: Connection Menu
:: ==============================================
:connect_menu
cls
echo ==============================================
echo           Device Connection Menu
echo ==============================================
echo.
echo Checking for already connected devices...
for /f "skip=1 tokens=1,2" %%A in ('adb devices') do (
  if /i NOT "%%B"=="device" (
    rem skip lines that are not actual devices
  ) else (
    set FOUND_DEVICE=1
  )
)
if defined FOUND_DEVICE (
  echo Device already connected.
  timeout /t 1 >nul
  goto main_menu
)
set FOUND_DEVICE=

echo.
echo Choose connection type:
echo   U) USB cable
echo   W) Wireless debugging (pair + connect)
echo   B) Back
set /p conn_choice=Enter choice [U/W/B]: 
if /i "%conn_choice%"=="B" goto main_menu
if /i "%conn_choice%"=="U" goto connect_usb
if /i "%conn_choice%"=="W" goto connect_wireless
echo Invalid choice.
pause
goto connect_menu

:connect_usb
cls
echo ==============================================
echo                USB Connection
echo ==============================================
echo.
echo 1) Connect your Android device via USB cable
echo 2) Ensure USB debugging is enabled (Developer options)
echo 3) Authorize the PC on your device when prompted
echo.
pause
adb kill-server >nul 2>&1
adb start-server >nul 2>&1
adb devices
echo.
set /p usb_seen=If you can see your device as "device", press Y to continue: 
if /i "%usb_seen%"=="Y" goto verdevsuccess
echo Device not detected. Try another cable/port and ensure authorization.
pause
goto connect_usb

:connect_wireless
cls
echo ==============================================
echo            Wireless Debugging Setup
echo ==============================================
echo.
echo On your ANDROID device:
echo 1) Open Developer options > Wireless debugging
echo 2) Tap "Pair device with pairing code"
echo 3) Note the IP:PAIR_PORT and the 6-digit Pairing Code
echo.
set /p pair_ip_port=Enter pairing IP:port (e.g., 192.168.1.50:37119): 
set /p pair_code=Enter the 6-digit pairing code: 
if "%pair_ip_port%"=="" (echo Invalid IP:port.& pause& goto connect_wireless)
if "%pair_code%"=="" (echo Invalid pairing code.& pause& goto connect_wireless)

echo Pairing...
adb pair "%pair_ip_port%" "%pair_code%"
if errorlevel 1 (
  echo Pairing failed. Please verify IP/port and code, then try again.
  pause
  goto connect_wireless
)
echo.
echo Now, still under Wireless debugging, note the Connect IP:PORT (different port).
set /p connect_ip_port=Enter connect IP:port (e.g., 192.168.1.50:49152): 
if "%connect_ip_port%"=="" (echo Invalid IP:port.& pause& goto connect_wireless)

echo Connecting...
adb connect "%connect_ip_port%"
if errorlevel 1 (
  echo Connect failed. Ensure device is on same network and Wireless debugging is active.
  pause
  goto connect_wireless
)
echo Connected over wireless.
timeout /t 1 >nul
goto verdevsuccess

:verdevsuccess
cls
echo ==============================================
echo           Device Connected Successfully
echo ==============================================
echo.
adb devices
echo.
pause
goto main_menu

:: ==============================================
:: Backup Section
:: ==============================================
:verify_connected_for_backup
for /f "skip=1 tokens=1,2" %%A in ('adb devices') do (
  if /i "%%B"=="device" set FOUND_DEVICE=1
)
if not defined FOUND_DEVICE (
  set FOUND_DEVICE=
  echo No device detected. Please connect first.
  pause
  goto connect_menu
)
set FOUND_DEVICE=
goto bcup

:bcup
cls
echo ==============================================
echo                Backup Mode
echo ==============================================
echo.
set "excluded_folder=Android"
set "local_directory=Pulled"
echo This will pull all folders from /sdcard/ except: !excluded_folder!
echo Destination: !local_directory!
pause

echo Listing folders on device (excluding !excluded_folder!)...
for /f "usebackq delims=" %%F in (`adb shell ls /sdcard/ 2^>nul`) do (
  echo %%F| findstr /i /v "^!excluded_folder!$" >nul && echo %%F>>"_folder_list.tmp"
)
if not exist "_folder_list.tmp" (
  echo Could not enumerate folders or none found.
  pause
  del "_folder_list.tmp" 2>nul
  goto main_menu
)

echo.
echo The following folders will be pulled:
type "_folder_list.tmp"
echo.
set /p confirm_pull=Press Y to confirm, any other key to cancel: 
if /i not "%confirm_pull%"=="Y" (
  echo Cancelled.
  del "_folder_list.tmp" 2>nul
  pause
  goto main_menu
)

echo Pulling folders...
for /f "usebackq delims=" %%F in ("_folder_list.tmp") do (
  echo Pulling: %%F
  adb pull -a "/sdcard/%%F" "!local_directory!" 2>nul 1>nul
)
del "_folder_list.tmp" 2>nul

echo Pulling WhatsApp media (if present)...
pushd "!local_directory!"
mkdir "Android\media" 2>nul
pushd "Android\media"
adb pull -a /sdcard/Android/media/com.whatsapp/ 2>nul 1>nul
adb pull -a /sdcard/Android/media/com.whatsapp.w4b/ 2>nul 1>nul
popd
mkdir "Recordings" 2>nul
pushd "Recordings"
adb pull -a /sdcard/Android/data/com.chiller3.bcr/files 2>nul 1>nul
popd
popd

echo.
echo Backup completed.
pause
goto main_menu

:: ==============================================
:: Restore Section
:: ==============================================
:verify_connected_for_restore
for /f "skip=1 tokens=1,2" %%A in ('adb devices') do (
  if /i "%%B"=="device" set FOUND_DEVICE=1
)
if not defined FOUND_DEVICE (
  set FOUND_DEVICE=
  echo No device detected. Please connect first.
  pause
  goto connect_menu
)
set FOUND_DEVICE=
goto res

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
