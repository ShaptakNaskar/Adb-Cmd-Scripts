import { BrowserWindow } from 'electron'

export interface LogEntry {
    type: 'command' | 'output' | 'error' | 'info'
    message: string
}

/**
 * Centralized logging service that sends command logs to the renderer
 */
export class LogService {
    private static instance: LogService
    private mainWindow: BrowserWindow | null = null

    private constructor() { }

    static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService()
        }
        return LogService.instance
    }

    setMainWindow(window: BrowserWindow): void {
        this.mainWindow = window
    }

    private emit(entry: LogEntry): void {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('command-log', entry)
        }
    }

    command(message: string): void {
        console.log(`[CMD] ${message}`)
        this.emit({ type: 'command', message })
    }

    output(message: string): void {
        console.log(`[OUT] ${message}`)
        this.emit({ type: 'output', message })
    }

    error(message: string): void {
        console.error(`[ERR] ${message}`)
        this.emit({ type: 'error', message })
    }

    info(message: string): void {
        console.log(`[INFO] ${message}`)
        this.emit({ type: 'info', message })
    }
}

export const logger = LogService.getInstance()
