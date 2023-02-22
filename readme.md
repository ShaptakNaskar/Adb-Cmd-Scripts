# ADB-CMD Scripts
## These are scripts I use for my specific usecase, It might be of no use to you :)

This repository contains Scripts which utilises CMD as the command processor and ADB to interface with Android Devices

These scripts heavily relies on Wireless Debugging.

>Requires ADB in Path, Use [Adb and Fastboot ++](https://github.com/K3V1991/ADB-and-FastbootPlusPlus/releases/latest)

## Android Pull WSL Push
> Gives User Choice between USB Debugging or Wireless Debugging
> Connects to the provided IP:PORT(only Wireless Debugging)  
> Pulls /sdcard/DCIM , /sdcard/Pictures/ , and /sdcard/Movies/ to the current directory  
> Deletes /sdcard/DCIM , /sdcard/Pictures/ , and /sdcard/Movies/ from Android Device  
> Waits for User Input and Connects to WSA at 127.0.0.1:58526 (Requires Debugging to be enabled in WSA)  
> Pushes pulled files to /sdcard/Pushed/ in WSA  
> Pushes files from Videos (%userprofile%\Videos) to /sdcard/Pushed/UserVids/  

## Install APK
> Connects to the provided IP:PORT  
> Opens File Picker Dialogue (To choose an APK file)  
> Installs the APK

## ADB Backup
>This script is an ADB backup script that allows the user to pull every folder from their Android device's internal storage (except for a specified folder) and put it in a local directory. It also asks the user if they want to backup their WhatsApp folder, and provides instructions on how to modify the excluded_folder and local_directory values in the script if desired.

