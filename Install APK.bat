@echo off
adb disconnect
set /p port=Enter IP and Port in IP:PORT Format: 
adb connect %port%
set dialog="about:<input type=file id=FILE><script>FILE.click();new ActiveXObject
set dialog=%dialog%('Scripting.FileSystemObject').GetStandardStream(1).WriteLine(FILE.value);
set dialog=%dialog%close();resizeTo(0,0);</script>"

for /f "tokens=* delims=" %%p in ('mshta.exe %dialog%') do set "file=%%p"
echo selected  file is : "%file%"
adb install "%file%"
adb disconnect
pause