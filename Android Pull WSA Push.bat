@echo off
:CHOICE2
cls
adb disconnect
cls
ECHO WELCOME TO ADB-CMD-WSA Pull-Push Utility
ECHO Please choose desired PULL Method from Phone
ECHO 1. USB PULL
ECHO 2. Network Pull
ECHO 3. Just WSA Push
ECHO 4. EXIT
set choice=
set /p choice=Choose any one: 
if not '%choice%'=='' set choice=%choice:~0,1%
if '%choice%'=='1' goto USB
if '%choice%'=='2' goto NET
if '%choice%'=='3' goto WSA
if '%choice%'=='4' goto EXIT
if '%choice%'=='5' goto exitchoice
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
cls
:exitchoice
ECHO.
ECHO 1. EXIT
ECHO 2. Go to Main Menu
set choice4=
set /p choice4=Choose any one: 
if not '%choice4%'=='' set choice4=%choice4:~0,1%
if '%choice4%'=='1' goto EXIT
if '%choice4%'=='2' goto CHOICE2
:EXIT
exit
