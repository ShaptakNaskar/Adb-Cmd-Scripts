import { Minus, Square, X } from 'lucide-react'
import './TitleBar.css'

export function TitleBar() {
    // Only show custom title bar on Windows/Linux
    const isMac = navigator.platform.toLowerCase().includes('mac')

    if (isMac) {
        return <div className="title-bar mac-drag-region" />
    }

    const handleMinimize = () => {
        // Electron will handle this via IPC
    }

    const handleMaximize = () => {
        // Electron will handle this via IPC
    }

    const handleClose = () => {
        window.close()
    }

    return (
        <div className="title-bar">
            <div className="title-bar-drag" />
            <div className="window-controls">
                <button className="window-btn minimize" onClick={handleMinimize} aria-label="Minimize">
                    <Minus size={14} />
                </button>
                <button className="window-btn maximize" onClick={handleMaximize} aria-label="Maximize">
                    <Square size={12} />
                </button>
                <button className="window-btn close" onClick={handleClose} aria-label="Close">
                    <X size={14} />
                </button>
            </div>
        </div>
    )
}
