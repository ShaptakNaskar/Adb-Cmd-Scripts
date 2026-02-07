import {
    Smartphone,
    Battery,
    BatteryCharging,
    Terminal,
    Check,
    AlertCircle,
    Shield
} from 'lucide-react'
import type { DeviceInfo, Toast } from '../../types'
import './DeviceCard.css'

interface DeviceCardProps {
    device: DeviceInfo
    isSelected: boolean
    onSelect: () => void
    onToast: (toast: Omit<Toast, 'id'>) => void
}

export function DeviceCard({ device, isSelected, onSelect, onToast }: DeviceCardProps) {
    const handleOpenShell = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await window.adb.openShell(device.serial)
            onToast({ type: 'success', message: 'Opening shell terminal...' })
        } catch (error) {
            onToast({ type: 'error', message: 'Failed to open shell' })
        }
    }

    const getStateColor = () => {
        switch (device.state) {
            case 'device': return 'var(--success)'
            case 'unauthorized': return 'var(--warning)'
            case 'offline': return 'var(--danger)'
            default: return 'var(--text-muted)'
        }
    }

    const getStateLabel = () => {
        switch (device.state) {
            case 'device': return 'Connected'
            case 'unauthorized': return 'Unauthorized'
            case 'offline': return 'Offline'
            default: return device.state
        }
    }

    const getBatteryIcon = () => {
        if (device.batteryStatus === 'charging') {
            return <BatteryCharging size={16} />
        }
        return <Battery size={16} />
    }

    const getBatteryColor = () => {
        if (device.batteryLevel < 0) return 'var(--text-muted)'
        if (device.batteryLevel <= 20) return 'var(--danger)'
        if (device.batteryLevel <= 50) return 'var(--warning)'
        return 'var(--success)'
    }

    return (
        <div
            className={`device-card ${isSelected ? 'selected' : ''} ${device.state !== 'device' ? 'inactive' : ''}`}
            onClick={onSelect}
        >
            <div className="card-header">
                <div className="device-avatar">
                    <Smartphone size={24} />
                </div>
                <div className="device-identity">
                    <h3 className="device-name">{device.model}</h3>
                    <span className="device-manufacturer">{device.manufacturer}</span>
                </div>
                <div className="device-status" style={{ '--status-color': getStateColor() } as any}>
                    <span className="status-indicator" />
                    <span className="status-label">{getStateLabel()}</span>
                </div>
            </div>

            <div className="card-body">
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Serial</span>
                        <span className="info-value mono">{device.serial}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Android</span>
                        <span className="info-value">{device.androidVersion} (API {device.sdkVersion})</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Battery</span>
                        <span className="info-value" style={{ color: getBatteryColor() }}>
                            {getBatteryIcon()}
                            {device.batteryLevel >= 0 ? `${device.batteryLevel}%` : 'Unknown'}
                            {device.batteryStatus === 'charging' && ' ⚡'}
                        </span>
                    </div>
                </div>

                <div className="status-badges">
                    <div className={`badge ${device.usbDebugging ? 'badge-success' : 'badge-warning'}`}>
                        {device.usbDebugging ? <Check size={12} /> : <AlertCircle size={12} />}
                        <span>USB Debug</span>
                    </div>
                </div>
            </div>

            {device.state === 'device' && (
                <div className="card-footer">
                    <button className="shell-btn" onClick={handleOpenShell}>
                        <Terminal size={16} />
                        <span>Open Shell</span>
                    </button>
                </div>
            )}

            {device.state === 'unauthorized' && (
                <div className="card-alert">
                    <Shield size={16} />
                    <span>Accept debugging prompt on device</span>
                </div>
            )}
        </div>
    )
}
