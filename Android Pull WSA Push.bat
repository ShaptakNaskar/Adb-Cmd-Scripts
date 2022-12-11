@echo off
adb disconnect
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
echo Now connecting WSA
adb connect 127.0.0.1:58526
pause
adb push . /sdcard/Pushed/
adb push %userprofile%\Videos\. /sdcard/Pushed/UserVids/
echo Done
pause