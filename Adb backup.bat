@echo off
title ADB-CMD Backup Script
mkdir Pulled
adb devices
cls


set excluded_folder="Android"

set local_directory="Pulled"
echo Welcome to ADB-CMD Backup Script
echo This ADB script will pull every folder from your Internal Storage
echo (except the %excluded_folder% folder) and put it in %local_directory% folder
echo Additionally This will also ask if you want to Backup your Whatsapp Folder(A11+)
pause
cls
echo Want to make changes? Open this file in a text editor, and change
echo "set excluded_folder=" and "set local_directory=" values 
pause
cls

echo Listing all folders on the Android device...
adb shell ls /sdcard/
pause
cls

echo Filtering out the excluded folder...
adb shell ls /sdcard/ | findstr /V %excluded_folder%
pause

echo The above folders will be pulled to %local_directory%.
set /p confirm=Press Y to confirm, or any other key to cancel: 

if /i not "%confirm%"=="Y" (
  echo Pull cancelled.
  pause
  exit /b 1
)

echo Pulling all folders except the excluded folder to %local_directory%...
for /f "tokens=* delims= " %%a in ('adb shell ls /sdcard/ ^| findstr /V %excluded_folder%') do (
  echo Pulling folder: %%a
  adb pull -a "/sdcard/%%a" "%local_directory%" || (
    echo Error pulling folder: %%a
    pause
  )
)

:WP
echo Do you want to Backup Whatsapp Folder (Y/N) (A11+ /sdcard/Android/media/com.whatsapp)

set /p choice56=Enter choice: 

if "%choice56%"=="Y" (
adb pull -a /sdcard/Android/media/com.whatsapp "%local_directory%"
) else if "%choice56%"=="N" (
echo OKAY
echo Thanks For using this script
) else (
    echo Invalid choice. Please enter Y or N.
goto WP
)
echo All folders pulled successfully!
pause
