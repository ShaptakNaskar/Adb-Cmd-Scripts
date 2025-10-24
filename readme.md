# ADB-CMD Scripts 🤖

## Your friendly neighborhood Android automation tools!

**TL;DR:** These are scripts I cobbled together for my oddly specific workflow. You might find them useful, or you might wonder what I was thinking. Either way, you're welcome! 😄

<p align="center">
<a href="http://forthebadge.com"><img src="https://forthebadge.com/images/badges/0-percent-optimized.svg" alt="forthebadge"/></a>
<a href="http://forthebadge.com"><img src="https://forthebadge.com/images/badges/it-works-why.svg" alt="forthebadge"/></a>
<a href="http://forthebadge.com"><img src="https://forthebadge.com/images/badges/ctrl-c-ctrl-v.svg" alt="forthebadge"/></a>
</p>

This repository contains batch scripts that use Windows CMD as their command processor and ADB (Android Debug Bridge) to boss around Android devices. These scripts were born out of laziness and necessity - the parents of all great inventions!

**Important:** These scripts heavily rely on Wireless Debugging because cables are so 2010.

> **⚠️ Prerequisites:** You need ADB in your system PATH. Get it here: [ADB and Fastboot ++](https://github.com/K3V1991/ADB-and-FastbootPlusPlus/releases/latest)

---

## 📱 The Scripts

### 🔄 Android Pull WSA Push
**What it does:** The ultimate media shuffle machine!

This script is like a digital bouncer that moves your photos and videos between your phone and Windows Subsystem for Android (WSA). Think of it as a very specific moving company.

**The Journey:**
- 🤔 Asks you: "USB or WiFi?" (Choose your adventure!)
- 📥 Pulls everything from `/sdcard/DCIM`, `/sdcard/Pictures/`, and `/sdcard/Movies/` to your PC
- 🗑️ Deletes those folders from your phone (don't worry, we already saved them!)
- ⏸️ Pauses dramatically and waits for you to enable WSA debugging
- 🔌 Connects to WSA at `127.0.0.1:58526` (that's fancy talk for "your computer")
- 📤 Pushes all that media goodness to `/sdcard/Pushed/` in WSA
- 🎥 Also grabs videos from your Windows Videos folder (`%userprofile%\Videos`) and sends them to `/sdcard/Pushed/UserVids/`

**Perfect for:** People who inexplicably need their phone photos on their Android emulator. You know who you are.

---

### 📦 Install APK
**What it does:** The lazy person's APK installer

Tired of clicking through Android's installation screens? This script turns APK installation into a two-click operation. Well, technically more clicks, but who's counting?

**The Process:**
- 🌐 Connects to your Android device via network (IP:PORT - it'll ask nicely)
- 📂 Opens a file picker (finally, a use for that mshta.exe thing!)
- 👆 You pick an APK file
- ✨ Magic happens (well, `adb install` happens, but close enough)
- 🎉 Your app is installed!

**Perfect for:** Developers who install APKs 47 times a day and refuse to manually drag and drop like peasants.

---

### 💾 ADB Backup & Restore
**What it does:** Your data's lifeguard 🏊‍♂️

The Swiss Army knife of backup scripts! This bad boy can backup your entire Android storage (well, most of it) and restore it later. It's like time travel for your files!

#### 🔵 **Backup Mode**

When you press 'B' (for "Better safe than sorry"):

1. **Device Check** 📱
   - Runs `adb devices` to make sure your phone is actually there
   - Gives you a chance to panic-connect if it's not

2. **The Great Pull** 🎣
   - Pulls *almost* everything from `/sdcard/` to a local `Pulled` folder
   - Smartly excludes the `Android` folder (nobody wants that bloat)
   - **Except** it sneakily grabs WhatsApp media from `/sdcard/Android/media/com.whatsapp/` (because priorities)
   - Also rescues your call recordings from BCR if you have them
   - Confirms before doing anything destructive (we're not monsters)

3. **Special Guests** 📞
   - Specifically targets WhatsApp and WhatsApp Business media
   - Saves call recorder files from BCR (Basic Call Recorder)
   - Creates organized folders for everything

#### 🟢 **Restore Mode**

When you press 'R' (for "Reverting my mistakes"):

1. **Directory Detective** 🕵️
   - Shows you the current directory
   - Asks if that's where you kept your backup
   - If not, lets you specify the correct path (in quotes, like a proper path)

2. **Confirmation Station** ✅
   - Shows you exactly what will be restored
   - Makes you type 'Y' to confirm (no accidental pushes here!)

3. **The Restoration** 🔄
   - Pushes everything back to `/sdcard/`
   - Installs a DataBackup.apk file (hopefully you have that)
   - Declares victory

**Perfect for:** People who switch phones often, ROM flashers, and anyone who's ever said "I should've backed that up" while crying.

---

## 🚀 How to Use

1. Make sure ADB is installed and in your PATH
2. Enable Wireless Debugging on your Android device (Settings → Developer Options → Wireless Debugging)
3. Double-click the script you need
4. Follow the on-screen instructions (they're pretty chatty)
5. Feel like a hacker

---

## ⚠️ Disclaimers

- These scripts assume you know what you're doing (dangerous assumption, I know)
- Always backup before restoring (yes, backup your backup)
- The scripts were tested on "my machine" and "it works for me" ™️
- May contain traces of spaghetti code and questionable decisions
- Not responsible for any data loss, broken phones, or existential crises

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

In human speak: You can use, modify, and distribute this code freely, but if you improve it, you gotta share your improvements too. It's the circle of life, open-source edition! 🦁

For the legal mumbo-jumbo, see the [LICENSE](LICENSE) file.

---

## 🤝 Contributing

Found a bug? Have a better way to do things? Want to add more jokes to the README?

Feel free to open an issue or submit a pull request! Just remember: if it works, don't fix it. If it doesn't work, then definitely fix it.

---

## 💬 Final Words

These scripts are like my children - janky, unpredictable, but they get the job done (usually). Use them wisely, and may your Android adventures be forever wire-free! ✨

*Made with ☕, 🍕, and a concerning amount of trial and error.*
