@echo off
adb disconnect
ECHO.
ECHO 1. USB PULL
ECHO 2. Network Pull
set choice=
set /p choice=Choose any one: 
if not '%choice%'=='' set choice=%choice:~0,1%
if '%choice%'=='1' goto USB
if '%choice%'=='2' goto NET
ECHO "%choice%" is not valid, try again
ECHO.
goto start
:USB
ECHO Please Connect Device
pause
adb pull -a /sdcard/DCIM/
adb pull -a /sdcard/Pictures/
adb pull -a /sdcard/Movies/
adb shell rm -f -rR -v /sdcard/DCIM/
adb shell rm -f -rR -v /sdcard/Pictures/
adb shell rm -f -rR -v /sdcard/Movies/
adb disconnect
echo Done Copying and Deleting From Phone
pause
goto WSA
:NET
set /p port=Enter IP and Port in IP:PORT Format: 
adb connect %port%
adb pull -a /sdcard/DCIM/
adb pull -a /sdcard/Pictures/
adb pull -a /sdcard/Movies/
adb shell rm -f -rR -v /sdcard/DCIM/
adb shell rm -f -rR -v /sdcard/Pictures/
adb shell rm -f -rR -v /sdcard/Movies/
adb disconnect
echo Done Copying and Deleting From Phone
pause
goto WSA
:WSA
echo Now connecting WSA
adb connect 127.0.0.1:58526
pause
adb push . /sdcard/Pushed/
adb push %userprofile%\Videos\. /sdcard/Pushed/UserVids/
echo Done
pause
