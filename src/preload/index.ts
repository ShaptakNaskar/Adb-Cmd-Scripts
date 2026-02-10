import { contextBridge, ipcRenderer, shell } from 'electron'

export interface DeviceInfo {
    serial: string
    state: 'device' | 'unauthorized' | 'offline' | 'no permissions'
    model: string
    manufacturer: string
    androidVersion: string
    sdkVersion: string
    batteryLevel: number
    batteryStatus: 'charging' | 'discharging' | 'full' | 'not charging' | 'unknown'
    usbDebugging: boolean
}

export interface FileEntry {
    name: string
    path: string
    isDirectory: boolean
    size: number
    modifiedTime: string
    permissions: string
}

export interface ProgressInfo {
    current: number
    total: number
    currentFile: string
    speed: string
    eta: string
    overallPercent: number
    filePercent: number
    elapsed: number
}

export interface LogEntry {
    type: 'command' | 'output' | 'error' | 'info'
    message: string
}

export interface AdbApi {
    // Device operations
    getDevices: () => Promise<DeviceInfo[]>
    getDeviceInfo: (serial: string) => Promise<DeviceInfo>
    onDevicesUpdated: (callback: (devices: DeviceInfo[]) => void) => () => void

    // File browser
    listFiles: (serial: string, path: string) => Promise<FileEntry[]>
    getCommonFolders: (serial: string) => Promise<FileEntry[]>

    // Backup/Restore
    selectBackupDestination: () => Promise<string | null>
    backupFiles: (serial: string, sources: string[], destination: string) => Promise<{ success: boolean; errors: string[] }>
    onBackupProgress: (callback: (progress: ProgressInfo) => void) => () => void
    cancelBackup: () => Promise<void>
    selectRestoreSource: () => Promise<string | null>
    restoreFiles: (serial: string, source: string, destination: string) => Promise<{ success: boolean; errors: string[] }>
    onRestoreProgress: (callback: (progress: ProgressInfo) => void) => () => void

    // APK
    selectApk: () => Promise<string | null>
    installApk: (serial: string, apkPath: string) => Promise<{ success: boolean; message: string }>

    // Screen capture
    screenshot: (serial: string) => Promise<{ success: boolean; path: string } | null>
    screenRecord: (serial: string, duration: number) => Promise<{ success: boolean; path: string } | null>
    stopScreenRecord: (serial: string) => Promise<void>

    // Reboot
    reboot: (serial: string, mode: 'system' | 'recovery' | 'bootloader') => Promise<void>

    // Shell
    openShell: (serial: string) => Promise<void>

    // Utility
    openFolder: (path: string) => Promise<void>
    openExternal: (url: string) => Promise<void>
    getAdbStatus: () => Promise<{ ready: boolean; path: string | null }>

    // Logging
    onCommandLog: (callback: (logEntry: LogEntry) => void) => () => void

    // Power tools
    listPackages: (serial: string, includeSystem: boolean) => Promise<string[]>
    disablePackage: (serial: string, pkg: string) => Promise<{ success: boolean; message: string }>
    enablePackage: (serial: string, pkg: string) => Promise<{ success: boolean; message: string }>
    uninstallPackage: (serial: string, pkg: string) => Promise<{ success: boolean; message: string }>
    sendKeyEvent: (serial: string, keycode: string) => Promise<void>
    rebootAdvanced: (serial: string, mode: string) => Promise<void>
    runLogcat: (serial: string, filter: string) => Promise<string>
    pushToDevice: (serial: string, destination: string) => Promise<{ success: boolean; message: string }>
}

const api: AdbApi = {
    // Device operations
    getDevices: () => ipcRenderer.invoke('get-devices'),
    getDeviceInfo: (serial) => ipcRenderer.invoke('get-device-info', serial),
    onDevicesUpdated: (callback) => {
        const handler = (_: Electron.IpcRendererEvent, devices: DeviceInfo[]) => callback(devices)
        ipcRenderer.on('devices-updated', handler)
        return () => ipcRenderer.removeListener('devices-updated', handler)
    },

    // File browser
    listFiles: (serial, path) => ipcRenderer.invoke('list-files', serial, path),
    getCommonFolders: (serial) => ipcRenderer.invoke('get-common-folders', serial),

    // Backup/Restore
    selectBackupDestination: () => ipcRenderer.invoke('select-backup-destination'),
    backupFiles: (serial, sources, destination) => ipcRenderer.invoke('backup-files', serial, sources, destination),
    onBackupProgress: (callback) => {
        const handler = (_: Electron.IpcRendererEvent, progress: ProgressInfo) => callback(progress)
        ipcRenderer.on('backup-progress', handler)
        return () => ipcRenderer.removeListener('backup-progress', handler)
    },
    cancelBackup: () => ipcRenderer.invoke('cancel-backup'),
    selectRestoreSource: () => ipcRenderer.invoke('select-restore-source'),
    restoreFiles: (serial, source, destination) => ipcRenderer.invoke('restore-files', serial, source, destination),
    onRestoreProgress: (callback) => {
        const handler = (_: Electron.IpcRendererEvent, progress: ProgressInfo) => callback(progress)
        ipcRenderer.on('restore-progress', handler)
        return () => ipcRenderer.removeListener('restore-progress', handler)
    },

    // APK
    selectApk: () => ipcRenderer.invoke('select-apk'),
    installApk: (serial, apkPath) => ipcRenderer.invoke('install-apk', serial, apkPath),

    // Screen capture
    screenshot: (serial) => ipcRenderer.invoke('screenshot', serial),
    screenRecord: (serial, duration) => ipcRenderer.invoke('screen-record', serial, duration),
    stopScreenRecord: (serial) => ipcRenderer.invoke('stop-screen-record', serial),

    // Reboot
    reboot: (serial, mode) => ipcRenderer.invoke('reboot', serial, mode),

    // Shell
    openShell: (serial) => ipcRenderer.invoke('open-shell', serial),

    // Utility
    openFolder: (path) => ipcRenderer.invoke('open-folder', path),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    getAdbStatus: () => ipcRenderer.invoke('get-adb-status'),

    // Logging
    onCommandLog: (callback) => {
        const handler = (_: Electron.IpcRendererEvent, logEntry: LogEntry) => callback(logEntry)
        ipcRenderer.on('command-log', handler)
        return () => ipcRenderer.removeListener('command-log', handler)
    },

    // Power tools
    listPackages: (serial, includeSystem) => ipcRenderer.invoke('list-packages', serial, includeSystem),
    disablePackage: (serial, pkg) => ipcRenderer.invoke('disable-package', serial, pkg),
    enablePackage: (serial, pkg) => ipcRenderer.invoke('enable-package', serial, pkg),
    uninstallPackage: (serial, pkg) => ipcRenderer.invoke('uninstall-package', serial, pkg),
    sendKeyEvent: (serial, keycode) => ipcRenderer.invoke('send-key-event', serial, keycode),
    rebootAdvanced: (serial, mode) => ipcRenderer.invoke('reboot-advanced', serial, mode),
    runLogcat: (serial, filter) => ipcRenderer.invoke('run-logcat', serial, filter),
    pushToDevice: (serial, destination) => ipcRenderer.invoke('push-to-device', serial, destination),
}

contextBridge.exposeInMainWorld('adb', api)

