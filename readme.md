# ADB-CMD Scripts
## These are scripts I use for my specific usecase, It might be of no use to you :)

This repository contains Scripts which utilises CMD as the command processor and ADB to interface with Android Devices

These scripts heavily relies on Wireless Debugging.

>Requires ADB in Path, Use [Adb and Fastboot ++](https://github.com/K3V1991/ADB-and-FastbootPlusPlus/releases/latest)

## Android Pull WSL Push
> Connects to the provided IP:PORT  
> Pulls /sdcard/DCIM , /sdcard/Pictures/ , and /sdcard/Movies/ to the current directory  
> Deletes /sdcard/DCIM , /sdcard/Pictures/ , and /sdcard/Movies/ from Android Device  
> Waits for User Input and Connects to WSA at 127.0.0.1:58526 (Requires Debugging to be enabled in WSA)  
> Pushes pulled files to /sdcard/Pushed/ in WSA  
> Pushes files from Videos (%userprofile%\Videos) to /sdcard/Pushed/UserVids/  