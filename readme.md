# ADB-CMD Scripts
## These are scripts I use for my specific usecase, It might be of no use to you :)
<p align="center">
  <a href="http://forthebadge.com/"><img src="https://forthebadge.com/images/badges/0-percent-optimized.svg" alt="forthebadge"/></a>
  <a href="http://forthebadge.com/"><img src="https://forthebadge.com/images/badges/it-works-why.svg" alt="forthebadge"/></a>
  <a href="http://forthebadge.com/"><img src="https://forthebadge.com/images/badges/ctrl-c-ctrl-v.svg" alt="forthebadge"/></a>
</p>

This repository contains Scripts which utilises CMD as the command processor and ADB to interface with Android Devices

These scripts heavily relies on Wireless Debugging.

>Requires ADB in Path, Use [Adb and Fastboot ++](https://github.com/K3V1991/ADB-and-FastbootPlusPlus/releases/latest)

## Android Pull WSA Push
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
### 1. Initialization:

> Turns off command echoing for a cleaner display.
> Sets the window title to "ADB-CMD Backup Restore Script".
> Creates a folder named "Pulled" for backups.
> Checks for connected Android devices using adb devices.

### 2. User Prompt:

> Presents a menu asking for backup (B) or restore (R) operation.
> Validates user input to ensure a valid choice.

### 3. Backup Function (:bcup):

> Explains the backup process and customization options.
> Lists folders on the Android device's internal storage.
> Excludes the specified folder (default: "Android").
> Filters out files with ".nomedia" in their names.
> Confirms the backup plan with the user.
> Pulls all folders (except the excluded one) to the "Pulled" folder.
> Specifically pulls WhatsApp media and Call Recorder files.
> Reports successful completion.

### 4. Restore Function (:res):

> Confirms the user's intention to restore files.
> Explains the restore process.
> Navigates to the appropriate directory based on WhatsApp backup status.
> Verifies the selected directory with the user.
> Lists files to be restored for confirmation.
> Pushes all files from the current directory to the Android device's /sdcard/.
> Installs a DataBackup.apk file 
> Reports successful completion.





