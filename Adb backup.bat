@echo off
title ADB-CMD Backup Restore Script
mkdir Pulled
cls
:verifydevice
cls
adb devices
echo If you can see your device press Y
echo Or If You can't, connect it using another terminal window and press enter
set /p confirmadbconnection=Enter Your Choice: 
if /i "%confirmadbconnection%"=="Y" (
  goto verdevsucess
)
else (
goto verifydevice
)
:verdevsucess
cls
set excluded_folder="Android"
set local_directory="Pulled"
echo Welcome to ADB-CMD Backup Restore Script
:askbr
set /p cho8=Enter B for Backup, R for Restore:
if /i "%cho8%"=="B" (
goto bcup
) else if /i "%cho8%"=="R" (
    goto res
) else (
    echo Invalid choice. Please B for Backup, R for Restore.
    goto askbr
)
:bcup

echo This part of the script will pull every folder from your Internal Storage
echo (except the %excluded_folder% folder) and put it in %local_directory% folder
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
mkdir "%local_directory%\Android\media\" && cd "%local_directory%\Android\media\" &&  adb pull -a /sdcard/Android/media/com.whatsapp/
cd ..
cd ..
mkdir Recordings
cd Recordings
adb pull -a /sdcard/Android/data/com.chiller3.bcr/files
cd ..
pause
echo All folders pulled successfully!
cls
echo Press any key to go back to main menu
pause
goto askbr

:res
goto resdffd
:resdffd
echo This part of the script will push every folder from the current directory to /sdcard/
pause
goto ask_directory
:wpask
set /p cho1=Did You backup WhatsApp (y/n):
if /i "%cho1%"=="n" (
cd %local_directory%
goto ask_directory
) else if /i "%cho1%"=="y" (
cd ..
cd ..
    goto ask_directory
) else (
    echo Invalid choice. Please enter 'y' for yes or 'n' for no.
    goto ask_directory
)

:ask_directory
echo Current directory: %CD%
set /p choice1=Is this the correct directory (y/n): 
if /i "%choice1%"=="n" (
   goto ask_restoredir
) else if /i "%choice1%"=="y" (
    cls && echo Directory selected: %CD% && goto restore
) else (
    echo Invalid choice. Please enter 'y' for yes or 'n' for no.
    goto ask_directory
)

:ask_restoredir
set /p restoredir=Enter the directory where you backed up /sdcard/ (in double quotations)- 
echo You entered- %restoredir%
cd /d %restoredir%
goto ask_directory

:restore
echo "The Following Folders will be restored"
dir
echo Press Y to accept, and any other key to exit the script
set /p cho2=Enter your choice: 

if /i "%cho2%"=="Y" (
    adb push . /sdcard/ && cd .. && adb install "%local_directory%\DataBackup\DataBackup.apk" && echo "All Done" && pause
) else (
    goto exit
)

:exit
echo Exiting the script...
pause
