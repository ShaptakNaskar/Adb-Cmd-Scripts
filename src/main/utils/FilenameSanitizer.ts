import { parse } from 'path'

/**
 * Cross-platform filename sanitizer that handles filesystem quirks
 * across Windows, macOS, and Linux
 */
export class FilenameSanitizer {
    // Windows reserved characters
    private readonly WINDOWS_INVALID_CHARS = /[<>:"/\\|?*\x00-\x1f]/g

    // Windows reserved names (case-insensitive)
    private readonly WINDOWS_RESERVED_NAMES = new Set([
        'CON', 'PRN', 'AUX', 'NUL',
        'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
        'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ])

    // Characters that cause issues on any platform
    private readonly UNIVERSAL_PROBLEMATIC = /[\x00-\x1f\x7f]/g

    private isWindows: boolean

    constructor() {
        this.isWindows = process.platform === 'win32'
    }

    /**
     * Sanitize a filename for the current platform
     */
    sanitize(filename: string): string {
        if (!filename) return 'unnamed'

        let result = filename

        // 1. Remove null bytes and control characters (all platforms)
        result = result.replace(this.UNIVERSAL_PROBLEMATIC, '')

        // 2. Handle Windows-specific restrictions
        if (this.isWindows) {
            result = this.sanitizeForWindows(result)
        }

        // 3. macOS: Normalize Unicode (NFC normalization)
        if (process.platform === 'darwin') {
            result = result.normalize('NFC')
        }

        // 4. Trim whitespace and dots from start/end
        result = result.replace(/^[\s.]+|[\s.]+$/g, '')

        // 5. If empty after sanitization, use a default name
        if (!result) {
            return 'unnamed'
        }

        // 6. Truncate if too long (255 bytes for most filesystems)
        if (Buffer.byteLength(result, 'utf8') > 250) {
            result = this.truncateToBytes(result, 250)
        }

        return result
    }

    /**
     * Sanitize a full path, keeping directory structure intact
     */
    sanitizePath(fullPath: string): string {
        const parts = fullPath.split(/[/\\]/)
        const sanitizedParts = parts.map((part, index) => {
            // Keep drive letters and root intact
            if (index === 0 && (part === '' || /^[A-Za-z]:$/.test(part))) {
                return part
            }
            return this.sanitize(part)
        })

        // Use platform-appropriate separator
        const separator = this.isWindows ? '\\' : '/'
        return sanitizedParts.join(separator)
    }

    /**
     * Generate a unique filename if one already exists
     */
    makeUnique(filename: string, existingNames: Set<string>): string {
        if (!existingNames.has(filename.toLowerCase())) {
            return filename
        }

        const { name, ext } = parse(filename)
        let counter = 1
        let newName: string

        do {
            newName = `${name} (${counter})${ext}`
            counter++
        } while (existingNames.has(newName.toLowerCase()) && counter < 1000)

        return newName
    }

    private sanitizeForWindows(filename: string): string {
        let result = filename

        // Replace invalid characters with underscore
        result = result.replace(this.WINDOWS_INVALID_CHARS, '_')

        // Handle reserved names
        const { name, ext } = parse(result)
        if (this.WINDOWS_RESERVED_NAMES.has(name.toUpperCase())) {
            result = `_${name}${ext}`
        }

        // Remove trailing dots and spaces (Windows strips these silently)
        result = result.replace(/[. ]+$/, '')

        return result
    }

    private truncateToBytes(str: string, maxBytes: number): string {
        const encoder = new TextEncoder()
        const encoded = encoder.encode(str)

        if (encoded.length <= maxBytes) {
            return str
        }

        // Find the last complete character within the byte limit
        let truncated = encoded.slice(0, maxBytes)

        // Remove incomplete UTF-8 sequences from the end
        while (truncated.length > 0) {
            try {
                return new TextDecoder('utf-8', { fatal: true }).decode(truncated)
            } catch {
                truncated = truncated.slice(0, -1)
            }
        }

        return 'unnamed'
    }

    /**
     * Check if a filename is problematic and needs sanitization
     */
    needsSanitization(filename: string): boolean {
        if (!filename) return true

        // Check for control characters
        if (this.UNIVERSAL_PROBLEMATIC.test(filename)) return true

        // Windows-specific checks
        if (this.isWindows) {
            if (this.WINDOWS_INVALID_CHARS.test(filename)) return true

            const { name } = parse(filename)
            if (this.WINDOWS_RESERVED_NAMES.has(name.toUpperCase())) return true

            if (/[. ]$/.test(filename)) return true
        }

        // Check length
        if (Buffer.byteLength(filename, 'utf8') > 255) return true

        return false
    }

    /**
     * Get a report of what changes would be made
     */
    getChanges(filename: string): { original: string; sanitized: string; changes: string[] } {
        const changes: string[] = []
        const sanitized = this.sanitize(filename)

        if (this.UNIVERSAL_PROBLEMATIC.test(filename)) {
            changes.push('Removed control characters')
        }

        if (this.isWindows && this.WINDOWS_INVALID_CHARS.test(filename)) {
            changes.push('Replaced Windows-invalid characters')
        }

        if (this.isWindows) {
            const { name } = parse(filename)
            if (this.WINDOWS_RESERVED_NAMES.has(name.toUpperCase())) {
                changes.push('Prefixed reserved filename')
            }
        }

        if (/^[\s.]+|[\s.]+$/.test(filename)) {
            changes.push('Trimmed leading/trailing whitespace and dots')
        }

        if (Buffer.byteLength(filename, 'utf8') > 250) {
            changes.push('Truncated to fit filesystem limits')
        }

        return { original: filename, sanitized, changes }
    }
}
