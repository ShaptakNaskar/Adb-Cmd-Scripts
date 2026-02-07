import { AdbService, FileEntry } from './AdbService'

export class FileBrowser {
    private adbService: AdbService

    constructor(adbService: AdbService) {
        this.adbService = adbService
    }

    async listFiles(serial: string, path: string): Promise<FileEntry[]> {
        try {
            // Normalize path to end with / so ls follows symlinks (e.g. /sdcard -> /storage/emulated/0)
            const normalizedPath = path.endsWith('/') ? path : path + '/'
            // Use ls -la for detailed output
            const output = this.execOnDevice(serial, `ls -la '${normalizedPath}'`)
            return this.parseListOutput(output, path)
        } catch (error) {
            console.error('Failed to list files:', error)
            return []
        }
    }

    async getDirectorySize(serial: string, path: string): Promise<number> {
        try {
            const output = this.execOnDevice(serial, `du -s '${path}' 2>/dev/null | cut -f1`)
            return parseInt(output.trim()) * 1024 // du outputs in KB
        } catch {
            return 0
        }
    }

    async getCommonFolders(serial: string): Promise<FileEntry[]> {
        const commonPaths = [
            '/sdcard/DCIM',
            '/sdcard/Pictures',
            '/sdcard/Download',
            '/sdcard/Documents',
            '/sdcard/Music',
            '/sdcard/Movies',
            '/sdcard/Audiobooks',
            '/sdcard/Podcasts',
            '/sdcard/Ringtones',
            '/sdcard/Alarms',
            '/sdcard/Notifications',
            '/sdcard/Screenshots',
            '/sdcard/Recordings',
            '/sdcard/Android/media/com.whatsapp',
            '/sdcard/Android/media/com.whatsapp.w4b'
        ]

        const results: FileEntry[] = []

        for (const path of commonPaths) {
            try {
                const exists = await this.pathExists(serial, path)
                if (exists) {
                    const size = await this.getDirectorySize(serial, path)
                    const name = path.split('/').pop() || path

                    results.push({
                        name,
                        path,
                        isDirectory: true,
                        size,
                        modifiedTime: '',
                        permissions: ''
                    })
                }
            } catch {
                // Folder doesn't exist or inaccessible
            }
        }

        return results
    }

    private async pathExists(serial: string, path: string): Promise<boolean> {
        try {
            this.execOnDevice(serial, `test -e '${path}' && echo 'exists'`)
            return true
        } catch {
            return false
        }
    }

    private execOnDevice(serial: string, command: string): string {
        const { execFileSync } = require('child_process')
        // Use execFileSync with array args to avoid host-shell quoting issues
        const result = execFileSync(
            this.adbService.adbPath,
            ['-s', serial, 'shell', command],
            { encoding: 'utf-8', timeout: 30000 }
        )
        return result
    }

    private parseListOutput(output: string, basePath: string): FileEntry[] {
        const lines = output.split('\n').filter(line => line.trim())
        const entries: FileEntry[] = []

        for (const line of lines) {
            // Skip total line
            if (line.startsWith('total')) continue

            // Parse ls -la output (handles SELinux dot/plus suffix and optional seconds in time)
            // drwxrwx--- 2 root sdcard_rw 4096 2024-01-15 10:30 DCIM
            // drwxrwx--x. 62 root everybody 4096 2024-01-15 10:30:45 DCIM
            const match = line.match(
                /^([drwxs\-lStT]+)[.+]?\s+\d+\s+\S+\s+\S+\s+(\d+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2})?)\s+(.+)$/
            )

            if (match) {
                const [, permissions, sizeStr, modifiedTime, name] = match

                // Skip . and ..
                if (name === '.' || name === '..') continue

                // Handle symlinks - extract actual name and target
                const isSymlink = permissions.startsWith('l')
                let actualName = name
                let symlinkTarget = ''

                if (name.includes(' -> ')) {
                    const parts = name.split(' -> ')
                    actualName = parts[0]
                    symlinkTarget = parts[1]
                }

                // Strip any leading slashes from names (can happen with symlink self-references)
                actualName = actualName.replace(/^\/+/, '').split('/').pop() || actualName

                // Skip problematic symlinks that cause infinite loops
                // - 'sdcard' in /sdcard (points to /storage/emulated/0)
                // - 'self' links
                // - symlinks pointing to parent directories
                if (actualName === 'sdcard' || actualName === 'self') continue
                if (isSymlink && (
                    symlinkTarget.startsWith('..') ||
                    symlinkTarget.includes('/sdcard') ||
                    symlinkTarget.includes('/storage/emulated') ||
                    symlinkTarget.includes('/storage/self')
                )) continue

                // Symlinks to directories should still be expandable (check via trailing / or
                // known directory patterns). For non-problematic symlinks, try to resolve them.
                let isDirectory = permissions.startsWith('d')
                if (isSymlink && !isDirectory) {
                    // Check if the symlink target looks like a directory path
                    // (no file extension, or we can verify by attempting to list it)
                    isDirectory = !symlinkTarget.includes('.') || symlinkTarget.endsWith('/')
                }

                entries.push({
                    name: actualName,
                    path: `${basePath}/${actualName}`.replace(/\/+/g, '/'),
                    isDirectory,
                    size: parseInt(sizeStr),
                    modifiedTime,
                    permissions
                })
            }
        }

        // Sort: directories first, then alphabetically
        return entries.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1
            if (!a.isDirectory && b.isDirectory) return 1
            return a.name.localeCompare(b.name)
        })
    }
}
