import { execSync, execFile } from 'child_process'
import { join, basename, dirname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { promisify } from 'util'
import { FilenameSanitizer } from '../utils/FilenameSanitizer'

const execFileAsync = promisify(execFile)

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
    bootloader: 'locked' | 'unlocked' | 'unknown'
    connectionType: 'usb' | 'wifi'
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
}

export class AdbService {
    public readonly adbPath: string
    private sanitizer: FilenameSanitizer

    constructor(adbPath: string) {
        this.adbPath = adbPath
        this.sanitizer = new FilenameSanitizer()
    }

    private exec(args: string[]): string {
        try {
            const result = execSync(`"${this.adbPath}" ${args.join(' ')}`, {
                encoding: 'utf-8',
                timeout: 30000,
                maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large outputs
            })
            return result.trim()
        } catch (error: unknown) {
            const err = error as { stderr?: Buffer; message?: string }
            throw new Error(err.stderr?.toString() ?? err.message ?? 'ADB command failed')
        }
    }

    private execDevice(serial: string, args: string[]): string {
        return this.exec(['-s', serial, ...args])
    }

    private async execAsync(args: string[]): Promise<string> {
        try {
            const { stdout } = await execFileAsync(this.adbPath, args, {
                encoding: 'utf-8',
                timeout: 0, // no timeout for large transfers
                maxBuffer: 50 * 1024 * 1024
            })
            return (stdout as string).trim()
        } catch (error: unknown) {
            const err = error as { stderr?: string; message?: string }
            throw new Error(err.stderr?.toString() ?? err.message ?? 'ADB command failed')
        }
    }

    private async execDeviceAsync(serial: string, args: string[]): Promise<string> {
        return this.execAsync(['-s', serial, ...args])
    }

    // Public async shell command for power tools
    async execDeviceShell(serial: string, command: string): Promise<string> {
        return this.execDeviceAsync(serial, ['shell', command])
    }

    async getDevices(): Promise<DeviceInfo[]> {
        const output = this.exec(['devices', '-l'])
        const lines = output.split('\n').slice(1).filter(line => line.trim())

        const devices: DeviceInfo[] = []

        for (const line of lines) {
            const parts = line.split(/\s+/)
            const serial = parts[0]
            const state = parts[1] as DeviceInfo['state']

            if (state === 'device') {
                try {
                    const info = await this.getDeviceInfo(serial)
                    devices.push(info)
                } catch {
                    devices.push({
                        serial,
                        state,
                        model: 'Unknown',
                        manufacturer: 'Unknown',
                        androidVersion: 'Unknown',
                        sdkVersion: 'Unknown',
                        batteryLevel: -1,
                        batteryStatus: 'unknown',
                        usbDebugging: true,
                        bootloader: 'unknown',
                        connectionType: serial.includes(':') ? 'wifi' : 'usb'
                    })
                }
            } else {
                devices.push({
                    serial,
                    state,
                    model: 'Unknown',
                    manufacturer: 'Unknown',
                    androidVersion: 'Unknown',
                    sdkVersion: 'Unknown',
                    batteryLevel: -1,
                    batteryStatus: 'unknown',
                    usbDebugging: false,
                    bootloader: 'unknown',
                    connectionType: serial.includes(':') ? 'wifi' : 'usb'
                })
            }
        }

        return devices
    }

    async getDeviceInfo(serial: string): Promise<DeviceInfo> {
        const getProp = (prop: string): string => {
            try {
                return this.execDevice(serial, ['shell', 'getprop', prop])
            } catch {
                return 'Unknown'
            }
        }

        const getBattery = (): { level: number; status: DeviceInfo['batteryStatus'] } => {
            try {
                const output = this.execDevice(serial, ['shell', 'dumpsys', 'battery'])
                const levelMatch = output.match(/level:\s*(\d+)/)
                const statusMatch = output.match(/status:\s*(\d+)/)

                const level = levelMatch ? parseInt(levelMatch[1]) : -1
                const statusNum = statusMatch ? parseInt(statusMatch[1]) : 0

                const statusMap: Record<number, DeviceInfo['batteryStatus']> = {
                    1: 'unknown',
                    2: 'charging',
                    3: 'discharging',
                    4: 'not charging',
                    5: 'full'
                }

                return { level, status: statusMap[statusNum] ?? 'unknown' }
            } catch {
                return { level: -1, status: 'unknown' }
            }
        }

        // Note: Bootloader state cannot be reliably detected via ADB
        // This attempts common properties but most devices don't expose this
        const getBootloaderState = (): DeviceInfo['bootloader'] => {
            try {
                // Try common properties (device-specific, often not available)
                const props = [
                    'ro.boot.flash.locked',
                    'ro.boot.verifiedbootstate',
                    'ro.secureboot.lockstate'
                ]

                for (const prop of props) {
                    const val = getProp(prop)
                    if (val === '0' || val === 'orange' || val === 'unlocked') return 'unlocked'
                    if (val === '1' || val === 'green' || val === 'locked') return 'locked'
                }

                return 'unknown'
            } catch {
                return 'unknown'
            }
        }

        const battery = getBattery()

        return {
            serial,
            state: 'device',
            model: getProp('ro.product.model'),
            manufacturer: getProp('ro.product.manufacturer'),
            androidVersion: getProp('ro.build.version.release'),
            sdkVersion: getProp('ro.build.version.sdk'),
            batteryLevel: battery.level,
            batteryStatus: battery.status,
            usbDebugging: true,
            bootloader: getBootloaderState(),
            connectionType: serial.includes(':') ? 'wifi' : 'usb'
        }
    }

    async pullFiles(
        serial: string,
        sources: string[],
        destination: string,
        onProgress?: (progress: ProgressInfo) => void
    ): Promise<{ success: boolean; errors: string[] }> {
        const errors: string[] = []
        const total = sources.length
        let current = 0

        for (const source of sources) {
            current++
            const sanitizedName = this.sanitizer.sanitize(basename(source))
            const destPath = join(destination, sanitizedName)

            onProgress?.({
                current,
                total,
                currentFile: source,
                speed: 'Calculating...',
                eta: 'Calculating...'
            })

            try {
                // Create destination directory
                const destDir = dirname(destPath)
                if (!existsSync(destDir)) {
                    mkdirSync(destDir, { recursive: true })
                }

                // Use async exec so the main thread stays responsive
                const output = await this.execDeviceAsync(serial, ['pull', '-a', source, destPath])

                // Parse speed from adb output (e.g. "1 file pulled, 0 skipped. 25.3 MB/s")
                const speedMatch = output.match(/(\d+\.?\d*)\s*(MB\/s|KB\/s|B\/s)/)
                const speed = speedMatch ? `${speedMatch[1]} ${speedMatch[2]}` : ''

                onProgress?.({
                    current,
                    total,
                    currentFile: source,
                    speed,
                    eta: current < total ? `${total - current} items remaining` : 'Finishing...'
                })
            } catch (error: unknown) {
                const err = error as { message?: string }
                errors.push(`${source}: ${err.message ?? 'Unknown error'}`)
            }
        }

        return { success: errors.length === 0, errors }
    }

    async pushFiles(
        serial: string,
        source: string,
        destination: string,
        onProgress?: (progress: ProgressInfo) => void
    ): Promise<{ success: boolean; errors: string[] }> {
        const errors: string[] = []

        onProgress?.({
            current: 1,
            total: 1,
            currentFile: source,
            speed: 'Calculating...',
            eta: 'Calculating...'
        })

        try {
            // Use async exec so the main thread stays responsive
            const output = await this.execDeviceAsync(serial, ['push', source, destination])

            const speedMatch = output.match(/(\d+\.?\d*)\s*(MB\/s|KB\/s|B\/s)/)
            const speed = speedMatch ? `${speedMatch[1]} ${speedMatch[2]}` : ''

            onProgress?.({
                current: 1,
                total: 1,
                currentFile: source,
                speed,
                eta: 'Finishing...'
            })
        } catch (error: unknown) {
            const err = error as { message?: string }
            errors.push(`${source}: ${err.message ?? 'Unknown error'}`)
        }

        return { success: errors.length === 0, errors }
    }

    async installApk(serial: string, apkPath: string): Promise<{ success: boolean; message: string }> {
        try {
            const output = await this.execDeviceAsync(serial, ['install', '-r', apkPath])
            return { success: output.includes('Success'), message: output }
        } catch (error: unknown) {
            const err = error as { message?: string }
            return { success: false, message: err.message ?? 'Installation failed' }
        }
    }

    async screenshot(serial: string, outputPath: string): Promise<{ success: boolean; path: string }> {
        try {
            const tempPath = '/sdcard/screenshot_temp.png'
            await this.execDeviceAsync(serial, ['shell', 'screencap', '-p', tempPath])
            await this.execDeviceAsync(serial, ['pull', tempPath, outputPath])
            await this.execDeviceAsync(serial, ['shell', 'rm', tempPath])
            return { success: true, path: outputPath }
        } catch (error: unknown) {
            const err = error as { message?: string }
            throw new Error(`Screenshot failed: ${err.message}`)
        }
    }

    async screenRecord(
        serial: string,
        outputPath: string,
        duration: number = 180
    ): Promise<{ success: boolean; path: string }> {
        const tempPath = '/sdcard/recording_temp.mp4'

        try {
            // Start recording (runs for the given duration)
            await this.execDeviceAsync(serial, [
                'shell',
                'screenrecord',
                '--time-limit',
                String(Math.min(duration, 180)),
                tempPath
            ])

            // Pull recording
            await this.execDeviceAsync(serial, ['pull', tempPath, outputPath])
            await this.execDeviceAsync(serial, ['shell', 'rm', tempPath])

            return { success: true, path: outputPath }
        } catch (error: unknown) {
            const err = error as { message?: string }
            throw new Error(`Screen recording failed: ${err.message}`)
        }
    }

    async reboot(serial: string, mode: 'system' | 'recovery' | 'bootloader'): Promise<void> {
        const args = mode === 'system' ? ['reboot'] : ['reboot', mode]
        this.execDevice(serial, args)
    }

    async connectWireless(ip: string, port: number = 5555): Promise<{ success: boolean; message: string }> {
        try {
            const output = this.exec(['connect', `${ip}:${port}`])
            return {
                success: output.includes('connected'),
                message: output
            }
        } catch (error: unknown) {
            const err = error as { message?: string }
            return { success: false, message: err.message ?? 'Connection failed' }
        }
    }

    async disconnectWireless(ip: string, port: number = 5555): Promise<void> {
        this.exec(['disconnect', `${ip}:${port}`])
    }

    async openShell(serial: string): Promise<void> {
        // This opens a terminal with adb shell - platform dependent
        const { spawn, execSync } = await import('child_process')

        if (process.platform === 'win32') {
            spawn('cmd', ['/c', 'start', 'cmd', '/k', `"${this.adbPath}"`, '-s', serial, 'shell'], {
                detached: true,
                stdio: 'ignore'
            })
        } else if (process.platform === 'darwin') {
            spawn('osascript', [
                '-e', `tell application "Terminal" to do script "\\"${this.adbPath}\\" -s ${serial} shell"`
            ], { detached: true, stdio: 'ignore' })
        } else {
            // Linux - use $TERMINAL env var first (most portable)
            const userTerminal = process.env.TERMINAL

            if (userTerminal) {
                try {
                    const child = spawn(userTerminal, ['-e', `${this.adbPath} -s ${serial} shell`], {
                        detached: true,
                        stdio: 'ignore'
                    })
                    child.unref()
                    return
                } catch {
                    // Fall through to auto-detection
                }
            }

            // Auto-detect available terminal
            const terminals = [
                { cmd: 'x-terminal-emulator', args: ['-e', `${this.adbPath} -s ${serial} shell`] },
                { cmd: 'alacritty', args: ['-e', this.adbPath, '-s', serial, 'shell'] },
                { cmd: 'kitty', args: ['--', this.adbPath, '-s', serial, 'shell'] },
                { cmd: 'wezterm', args: ['start', '--', this.adbPath, '-s', serial, 'shell'] },
                { cmd: 'konsole', args: ['-e', this.adbPath, '-s', serial, 'shell'] },
                { cmd: 'gnome-terminal', args: ['--', this.adbPath, '-s', serial, 'shell'] },
                { cmd: 'xfce4-terminal', args: ['-e', `${this.adbPath} -s ${serial} shell`] },
                { cmd: 'xterm', args: ['-e', this.adbPath, '-s', serial, 'shell'] }
            ]

            for (const term of terminals) {
                try {
                    execSync(`which ${term.cmd}`, { encoding: 'utf-8', stdio: 'pipe' })
                    const child = spawn(term.cmd, term.args, {
                        detached: true,
                        stdio: 'ignore'
                    })
                    child.unref()
                    return
                } catch {
                    continue
                }
            }

            throw new Error('No terminal found. Set $TERMINAL env var or install a terminal emulator.')
        }
    }
}
