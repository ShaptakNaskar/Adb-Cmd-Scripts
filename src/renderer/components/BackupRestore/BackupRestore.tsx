import { useState, useEffect, useCallback } from 'react'
import {
    HardDrive,
    Download,
    Upload,
    Folder,
    FolderOpen,
    File,
    Check,
    ChevronRight,
    ChevronDown,
    RefreshCw,
    Loader2,
    Clock,
    Zap,
    XCircle
} from 'lucide-react'
import type { DeviceInfo, FileEntry, Toast } from '../../types'
import './BackupRestore.css'

interface BackupRestoreProps {
    device: DeviceInfo | null
    onToast: (toast: Omit<Toast, 'id'>) => void
}

interface TreeNode extends FileEntry {
    children?: TreeNode[]
    isLoading?: boolean
    isExpanded?: boolean
}

const PRESET_FOLDERS = [
    { path: '/sdcard/DCIM', label: 'Camera (DCIM)', icon: '📷' },
    { path: '/sdcard/Pictures', label: 'Pictures', icon: '🖼️' },
    { path: '/sdcard/Download', label: 'Downloads', icon: '📥' },
    { path: '/sdcard/Documents', label: 'Documents', icon: '📄' },
    { path: '/sdcard/Music', label: 'Music', icon: '🎵' },
    { path: '/sdcard/Movies', label: 'Movies', icon: '🎬' },
    { path: '/sdcard/Screenshots', label: 'Screenshots', icon: '📸' },
    { path: '/sdcard/Recordings', label: 'Recordings', icon: '🎙️' },
    { path: '/sdcard/Audiobooks', label: 'Audiobooks', icon: '📚' },
    { path: '/sdcard/Podcasts', label: 'Podcasts', icon: '🎧' },
    { path: '/sdcard/Ringtones', label: 'Ringtones', icon: '🔔' },
    { path: '/sdcard/Alarms', label: 'Alarms', icon: '⏰' },
    { path: '/sdcard/Notifications', label: 'Notifications', icon: '🔊' },
    { path: '/sdcard/Android/media', label: 'Android Media (WhatsApp, etc)', icon: '💬' },
]

// Paths for "Backup Everything" - excludes Android/data and Android/obb for safety
const BACKUP_ALL_PATHS = [
    '/sdcard/DCIM',
    '/sdcard/Pictures',
    '/sdcard/Download',
    '/sdcard/Documents',
    '/sdcard/Music',
    '/sdcard/Movies',
    '/sdcard/Screenshots',
    '/sdcard/Recordings',
    '/sdcard/Audiobooks',
    '/sdcard/Podcasts',
    '/sdcard/Ringtones',
    '/sdcard/Alarms',
    '/sdcard/Notifications',
    '/sdcard/Android/media',
]

export function BackupRestore({ device, onToast }: BackupRestoreProps) {
    const [mode, setMode] = useState<'backup' | 'restore'>('backup')
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
    const [fileTree, setFileTree] = useState<TreeNode[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0, currentFile: '', speed: '', eta: '', overallPercent: 0, filePercent: 0, elapsed: 0 })
    const [viewMode, setViewMode] = useState<'presets' | 'tree'>('presets')

    const loadRootDirectory = useCallback(async () => {
        if (!device) return
        setIsLoading(true)
        try {
            const files = await window.adb.listFiles(device.serial, '/sdcard')
            const tree: TreeNode[] = files.map(f => ({
                ...f,
                children: f.isDirectory ? [] : undefined,
                isExpanded: false
            }))
            setFileTree(tree)
        } catch (error) {
            onToast({ type: 'error', message: 'Failed to load device files' })
        } finally {
            setIsLoading(false)
        }
    }, [device, onToast])

    // Load tree only when switching to tree view or device changes
    useEffect(() => {
        if (device && viewMode === 'tree' && fileTree.length === 0) {
            loadRootDirectory()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device?.serial, viewMode])

    useEffect(() => {
        const unsubscribe = window.adb.onBackupProgress((p) => {
            setProgress(p)
        })
        return unsubscribe
    }, [])

    const togglePathSelection = (path: string) => {
        setSelectedPaths(prev => {
            const next = new Set(prev)
            if (next.has(path)) {
                next.delete(path)
            } else {
                next.add(path)
            }
            return next
        })
    }

    const selectAllPresets = () => {
        setSelectedPaths(new Set(PRESET_FOLDERS.map(f => f.path)))
    }

    const selectBackupAll = () => {
        setSelectedPaths(new Set(BACKUP_ALL_PATHS))
    }

    const clearSelection = () => {
        setSelectedPaths(new Set())
    }

    const loadChildren = async (node: TreeNode, path: string[]) => {
        if (!device) return

        const updateNode = (nodes: TreeNode[], pathParts: string[], update: Partial<TreeNode>): TreeNode[] => {
            if (pathParts.length === 0) return nodes

            return nodes.map(n => {
                if (n.name === pathParts[0]) {
                    if (pathParts.length === 1) {
                        return { ...n, ...update }
                    }
                    return {
                        ...n,
                        children: updateNode(n.children || [], pathParts.slice(1), update)
                    }
                }
                return n
            })
        }

        // Set loading state
        setFileTree(prev => updateNode(prev, path, { isLoading: true }))

        try {
            const files = await window.adb.listFiles(device.serial, node.path)
            const children: TreeNode[] = files.map(f => ({
                ...f,
                children: f.isDirectory ? [] : undefined,
                isExpanded: false
            }))

            setFileTree(prev => updateNode(prev, path, {
                children,
                isLoading: false,
                isExpanded: true
            }))
        } catch (error) {
            setFileTree(prev => updateNode(prev, path, { isLoading: false }))
            onToast({ type: 'error', message: `Failed to load ${node.name}` })
        }
    }

    const toggleExpand = (node: TreeNode, path: string[]) => {
        if (!node.isDirectory) return

        if (!node.isExpanded && (!node.children || node.children.length === 0)) {
            loadChildren(node, path)
        } else {
            const updateNode = (nodes: TreeNode[], pathParts: string[]): TreeNode[] => {
                return nodes.map(n => {
                    if (n.name === pathParts[0]) {
                        if (pathParts.length === 1) {
                            return { ...n, isExpanded: !n.isExpanded }
                        }
                        return {
                            ...n,
                            children: updateNode(n.children || [], pathParts.slice(1))
                        }
                    }
                    return n
                })
            }
            setFileTree(prev => updateNode(prev, path))
        }
    }

    const handleBackup = async () => {
        if (!device || selectedPaths.size === 0) {
            onToast({ type: 'warning', message: 'Select folders to backup' })
            return
        }

        const destination = await window.adb.selectBackupDestination()
        if (!destination) return

        setIsProcessing(true)
        try {
            const result = await window.adb.backupFiles(
                device.serial,
                Array.from(selectedPaths),
                destination
            )

            if (result.success) {
                onToast({ type: 'success', message: 'Backup completed successfully!' })
                await window.adb.openFolder(destination)
            } else {
                onToast({
                    type: 'warning',
                    message: `Backup completed with ${result.errors.length} errors`
                })
            }
        } catch (error) {
            onToast({ type: 'error', message: 'Backup failed' })
        } finally {
            setIsProcessing(false)
            setProgress({ current: 0, total: 0, currentFile: '', speed: '', eta: '', overallPercent: 0, filePercent: 0, elapsed: 0 })
        }
    }

    const handleRestore = async () => {
        if (!device) return

        const source = await window.adb.selectRestoreSource()
        if (!source) return

        setIsProcessing(true)
        try {
            const result = await window.adb.restoreFiles(device.serial, source, '/sdcard/')

            if (result.success) {
                onToast({ type: 'success', message: 'Restore completed successfully!' })
            } else {
                onToast({
                    type: 'warning',
                    message: `Restore completed with ${result.errors.length} errors`
                })
            }
        } catch (error) {
            onToast({ type: 'error', message: 'Restore failed' })
        } finally {
            setIsProcessing(false)
            setProgress({ current: 0, total: 0, currentFile: '', speed: '', eta: '', overallPercent: 0, filePercent: 0, elapsed: 0 })
        }
    }

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
    }

    const formatElapsed = (seconds: number): string => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        if (m > 0) return `${m}m ${s}s`
        return `${s}s`
    }

    const renderTreeNode = (node: TreeNode, path: string[] = [], depth: number = 0): JSX.Element => {
        const currentPath = [...path, node.name]
        const isSelected = selectedPaths.has(node.path)

        return (
            <div key={node.path} className="tree-item">
                <div
                    className={`tree-row ${isSelected ? 'selected' : ''}`}
                    style={{ paddingLeft: `${depth * 20 + 12}px` }}
                >
                    {node.isDirectory && (
                        <button
                            className="expand-btn"
                            onClick={() => toggleExpand(node, currentPath)}
                        >
                            {node.isLoading ? (
                                <Loader2 size={14} className="spin" />
                            ) : node.isExpanded ? (
                                <ChevronDown size={14} />
                            ) : (
                                <ChevronRight size={14} />
                            )}
                        </button>
                    )}

                    <label className="tree-label">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePathSelection(node.path)}
                            className="tree-checkbox"
                        />
                        {node.isDirectory ? (
                            node.isExpanded ? <FolderOpen size={16} className="icon-folder" /> : <Folder size={16} className="icon-folder" />
                        ) : (
                            <File size={16} className="icon-file" />
                        )}
                        <span className="tree-name">{node.name}</span>
                        {!node.isDirectory && node.size > 0 && (
                            <span className="tree-size">{formatSize(node.size)}</span>
                        )}
                    </label>
                </div>

                {node.isExpanded && node.children && (
                    <div className="tree-children">
                        {node.children.map(child => renderTreeNode(child, currentPath, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    if (!device) {
        return (
            <div className="backup-restore">
                <div className="no-device">
                    <HardDrive size={48} />
                    <h2>No Device Selected</h2>
                    <p>Select a device from the dashboard to backup or restore</p>
                </div>
            </div>
        )
    }

    return (
        <div className="backup-restore">
            <header className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <HardDrive />
                    </div>
                    <div className="header-text">
                        <h1>Backup & Restore</h1>
                        <p>Transfer files between {device.model} and your computer</p>
                    </div>
                </div>
                <div className="mode-toggle">
                    <button
                        className={`mode-btn ${mode === 'backup' ? 'active' : ''}`}
                        onClick={() => setMode('backup')}
                    >
                        <Download size={18} />
                        <span>Backup</span>
                    </button>
                    <button
                        className={`mode-btn ${mode === 'restore' ? 'active' : ''}`}
                        onClick={() => setMode('restore')}
                    >
                        <Upload size={18} />
                        <span>Restore</span>
                    </button>
                </div>
            </header>

            <div className="backup-content">
                {mode === 'backup' ? (
                    <>
                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'presets' ? 'active' : ''}`}
                                onClick={() => setViewMode('presets')}
                            >
                                Quick Select
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
                                onClick={() => setViewMode('tree')}
                            >
                                Browse Files
                            </button>
                        </div>

                        <div className="selection-actions">
                            <button className="action-link primary" onClick={selectBackupAll}>
                                ⚡ Backup Everything
                            </button>
                            <button className="action-link" onClick={selectAllPresets}>
                                Select All Common
                            </button>
                            <button className="action-link" onClick={clearSelection}>
                                Clear Selection
                            </button>
                            <span className="selection-count">
                                {selectedPaths.size} selected
                            </span>
                        </div>

                        {viewMode === 'presets' ? (
                            <div className="preset-grid">
                                {PRESET_FOLDERS.map(preset => (
                                    <button
                                        key={preset.path}
                                        className={`preset-card ${selectedPaths.has(preset.path) ? 'selected' : ''}`}
                                        onClick={() => togglePathSelection(preset.path)}
                                    >
                                        <span className="preset-icon">{preset.icon}</span>
                                        <span className="preset-label">{preset.label}</span>
                                        {selectedPaths.has(preset.path) && (
                                            <Check size={16} className="preset-check" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="file-tree">
                                <div className="tree-header">
                                    <span>/sdcard/</span>
                                    <button className="refresh-tree" onClick={loadRootDirectory}>
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                                <div className="tree-container">
                                    {isLoading ? (
                                        <div className="tree-loading">
                                            <Loader2 size={24} className="spin" />
                                            <span>Loading files...</span>
                                        </div>
                                    ) : (
                                        fileTree.map(node => renderTreeNode(node, [], 0))
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="backup-actions">
                            <button
                                className="primary-btn"
                                onClick={handleBackup}
                                disabled={isProcessing || selectedPaths.size === 0}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={18} className="spin" />
                                        <span>Backing up...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        <span>Start Backup</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {isProcessing && (
                            <div className="progress-panel">
                                <div className="progress-header">
                                    <div className="progress-stats">
                                        <span className="progress-stat">
                                            <Clock size={14} />
                                            {formatElapsed(progress.elapsed)}
                                        </span>
                                        {progress.speed && progress.speed !== 'Starting...' && progress.speed !== 'Transferring...' && (
                                            <span className="progress-stat speed">
                                                <Zap size={14} />
                                                {progress.speed}
                                            </span>
                                        )}
                                        <span className="progress-stat">
                                            Folder {progress.current} / {progress.total}
                                        </span>
                                        <div className="progress-actions">
                                            {progress.eta && (
                                                <span className="progress-eta">{progress.eta}</span>
                                            )}
                                            <button
                                                className="cancel-backup-btn"
                                                onClick={async () => {
                                                    await window.adb.cancelBackup()
                                                    setIsProcessing(false)
                                                }}
                                                title="Cancel backup"
                                            >
                                                <XCircle size={16} />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="progress-file">
                                    <span className="progress-file-name" title={progress.currentFile}>
                                        {progress.currentFile || 'Preparing...'}
                                    </span>
                                    {progress.filePercent > 0 && progress.filePercent < 100 && (
                                        <span className="progress-file-pct">{progress.filePercent}%</span>
                                    )}
                                </div>

                                <div className="progress-bars">
                                    <div className="progress-bar-row">
                                        <span className="progress-bar-label">Overall</span>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: progress.overallPercent > 0
                                                        ? `${progress.overallPercent}%`
                                                        : '100%',
                                                    animation: progress.overallPercent === 0 ? 'pulse 1.5s ease-in-out infinite' : 'none'
                                                }}
                                            />
                                        </div>
                                        <span className="progress-bar-pct">{progress.overallPercent}%</span>
                                    </div>
                                    {progress.filePercent > 0 && progress.filePercent < 100 && (
                                        <div className="progress-bar-row">
                                            <span className="progress-bar-label">File</span>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill file-fill"
                                                    style={{ width: `${progress.filePercent}%` }}
                                                />
                                            </div>
                                            <span className="progress-bar-pct">{progress.filePercent}%</span>
                                        </div>
                                    )}
                                </div>

                                <div className="progress-pulse-dot" />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="restore-panel">
                        <div className="restore-info">
                            <div className="info-icon">
                                <Upload size={48} />
                            </div>
                            <h2>Restore from Computer</h2>
                            <p>Select a folder on your computer to push to the device's /sdcard/ directory</p>
                            <button
                                className="primary-btn"
                                onClick={handleRestore}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={18} className="spin" />
                                        <span>Restoring...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        <span>Select Folder to Restore</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
