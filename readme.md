# ADB-CMD Scripts
## These are scripts I use for my specific usecase, It might be of no use to you :)
<p align="center">
  <a href="http://forthebadge.com/"><img src="https://forthebadge.com/images/badges/0-percent-optimized.svg" alt="forthebadge"/></a>
  <a href="http://forthebadge.com/"><img src="https://forthebadge.com/images/badges/it-works-why.svg" alt="forthebadge"/></a>
  <a href="http://forthebadge.com/"><img src="https://forthebadge.com/images/badges/ctrl-c-ctrl-v.svg" alt="forthebadge"/></a>
  [![forthebadge](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAuOTUzMTgyMjIwNDU5IiBoZWlnaHQ9IjM1IiB2aWV3Qm94PSIwIDAgMzIwLjk1MzE4MjIyMDQ1OSAzNSI+PHJlY3Qgd2lkdGg9IjE1MS44OTA2NTU1MTc1NzgxMiIgaGVpZ2h0PSIzNSIgZmlsbD0iI0ZGQ0RCMiIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1maWxsPSIiIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLWZpbGw6ICMzZTE2MDA7Ii8+PHJlY3QgeD0iMTUxLjg5MDY1NTUxNzU3ODEyIiB3aWR0aD0iOTcuMzc1MDE1MjU4Nzg5MDYiIGhlaWdodD0iMzUiIGZpbGw9IiM0QzRDNkQiIGRhdGEtZGFya3JlYWRlci1pbmxpbmUtZmlsbD0iIiBzdHlsZT0iLS1kYXJrcmVhZGVyLWlubGluZS1maWxsOiAjM2QzZDU3OyIvPjx0ZXh0IHg9Ijc1Ljk0NTMyNzc1ODc4OTA2IiB5PSIxNy41IiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iJ1JvYm90bycsIHNhbnMtc2VyaWYiIGZpbGw9IiM0QzRDNkQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBsZXR0ZXItc3BhY2luZz0iMiIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1maWxsPSIiIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLWZpbGw6ICNhY2FjYWM7Ij5DT0RFIFdSSVRURU4gQlk8L3RleHQ+PHRleHQgeD0iMjAwLjU3ODE2MzE0Njk3MjY2IiB5PSIxNy41IiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iJ01vbnRzZXJyYXQnLCBzYW5zLXNlcmlmIiBmaWxsPSIjRkZDREIyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iOTAwIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgbGV0dGVyLXNwYWNpbmc9IjIiIGRhdGEtZGFya3JlYWRlci1pbmxpbmUtZmlsbD0iIiBzdHlsZT0iLS1kYXJrcmVhZGVyLWlubGluZS1maWxsOiAjZmZkMmJhOyI+Q0hBVEdQVDwvdGV4dD48cmVjdCB4PSIyNDkuMjY1NjcwNzc2MzY3MiIgd2lkdGg9IjcxLjY4NzUxMTQ0NDA5MTgiIGhlaWdodD0iMzUiIGZpbGw9IiIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtZmlsbDogIzFlNWQ4MzsiLz48dGV4dCB4PSIyODUuMTA5NDI2NDk4NDEzMSIgeT0iMTcuNSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IidSb2JvdG8nLCBzYW5zLXNlcmlmIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iNTAwIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgbGV0dGVyLXNwYWNpbmc9IjIiIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLWZpbGw6ICNmZmZmZmY7Ij5BSSBGVFc8L3RleHQ+PC9zdmc+)](https://forthebadge.com)
</p>

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





