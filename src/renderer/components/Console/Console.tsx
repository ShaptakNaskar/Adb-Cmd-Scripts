import { useState, useEffect, useRef } from 'react'
import { Terminal, Download, Trash2, Copy, Check } from 'lucide-react'
import './Console.css'

export interface LogEntry {
    id: string
    timestamp: Date
    type: 'command' | 'output' | 'error' | 'info'
    message: string
}

interface ConsoleProps {
    logs: LogEntry[]
    onClearLogs: () => void
}

export function Console({ logs, onClearLogs }: ConsoleProps) {
    const [copied, setCopied] = useState(false)
    const consoleRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight
        }
    }, [logs])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const exportLogs = () => {
        const content = logs.map(log =>
            `[${formatTime(log.timestamp)}] [${log.type.toUpperCase()}] ${log.message}`
        ).join('\n')

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `adb-commander-logs-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const copyLogs = async () => {
        const content = logs.map(log =>
            `[${formatTime(log.timestamp)}] [${log.type.toUpperCase()}] ${log.message}`
        ).join('\n')

        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="console">
            <header className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Terminal />
                    </div>
                    <div className="header-text">
                        <h1>Console</h1>
                        <p>ADB command logs and outputs</p>
                    </div>
                </div>
                <div className="console-actions">
                    <button className="console-btn" onClick={copyLogs} title="Copy logs">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button className="console-btn" onClick={exportLogs} title="Export logs">
                        <Download size={16} />
                    </button>
                    <button className="console-btn danger" onClick={onClearLogs} title="Clear logs">
                        <Trash2 size={16} />
                    </button>
                </div>
            </header>

            <div className="console-content" ref={consoleRef}>
                {logs.length === 0 ? (
                    <div className="empty-console">
                        <Terminal size={32} />
                        <span>No logs yet. Commands will appear here when executed.</span>
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className={`log-entry ${log.type}`}>
                            <span className="log-time">{formatTime(log.timestamp)}</span>
                            <span className="log-type">[{log.type.toUpperCase()}]</span>
                            <span className="log-message">{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
