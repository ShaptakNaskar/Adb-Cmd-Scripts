import { Clock, Zap, HardDrive, X, XCircle } from 'lucide-react'
import type { ProgressInfo } from '../../types'
import './BackupOverlay.css'

interface BackupOverlayProps {
    progress: ProgressInfo
    onNavigate: () => void
    onDismiss: () => void
}

export function BackupOverlay({ progress, onNavigate, onDismiss }: BackupOverlayProps) {
    const formatElapsed = (seconds: number): string => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        if (m > 0) return `${m}m ${s}s`
        return `${s}s`
    }

    // Get just the filename from the full path
    const fileName = progress.currentFile
        ? progress.currentFile.split('/').pop() || progress.currentFile
        : 'Preparing...'

    return (
        <div className="backup-overlay" onClick={onNavigate}>
            <div className="backup-overlay-header">
                <div className="backup-overlay-title">
                    <HardDrive size={14} />
                    <span>Backup in progress</span>
                </div>
                <button
                    className="backup-overlay-close"
                    onClick={(e) => {
                        e.stopPropagation()
                        onDismiss()
                    }}
                    title="Dismiss (backup continues)"
                >
                    <X size={12} />
                </button>
            </div>

            <div className="backup-overlay-file" title={progress.currentFile}>
                {fileName}
            </div>

            <div className="backup-overlay-bar">
                <div
                    className="backup-overlay-fill"
                    style={{
                        width: progress.overallPercent > 0
                            ? `${progress.overallPercent}%`
                            : '100%',
                        animation: progress.overallPercent === 0 ? 'pulse 1.5s ease-in-out infinite' : 'none'
                    }}
                />
            </div>

            <div className="backup-overlay-stats">
                <span className="backup-overlay-stat">
                    <Clock size={11} />
                    {formatElapsed(progress.elapsed)}
                </span>
                {progress.speed && progress.speed !== 'Starting...' && progress.speed !== 'Transferring...' && (
                    <span className="backup-overlay-stat speed">
                        <Zap size={11} />
                        {progress.speed}
                    </span>
                )}
                <span className="backup-overlay-stat">
                    {progress.current}/{progress.total}
                </span>
                {progress.overallPercent > 0 && (
                    <span className="backup-overlay-stat">
                        {progress.overallPercent}%
                    </span>
                )}
                <button
                    className="backup-overlay-cancel"
                    onClick={async (e) => {
                        e.stopPropagation()
                        await window.adb.cancelBackup()
                    }}
                    title="Cancel backup"
                >
                    <XCircle size={11} />
                    Cancel
                </button>
            </div>

            <div className="backup-overlay-pulse" />
        </div>
    )
}
