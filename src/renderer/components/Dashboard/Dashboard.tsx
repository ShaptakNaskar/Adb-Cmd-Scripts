import { Smartphone, MonitorSmartphone, RefreshCw } from 'lucide-react'
import { DeviceCard } from '../DeviceCard/DeviceCard'
import type { DeviceInfo, Toast } from '../../types'
import './Dashboard.css'

interface DashboardProps {
    devices: DeviceInfo[]
    selectedDevice: DeviceInfo | null
    onSelectDevice: (device: DeviceInfo) => void
    onToast: (toast: Omit<Toast, 'id'>) => void
}

export function Dashboard({ devices, selectedDevice, onSelectDevice, onToast }: DashboardProps) {
    const handleRefresh = async () => {
        try {
            await window.adb.getDevices()
            onToast({ type: 'info', message: 'Refreshed device list' })
        } catch (error) {
            onToast({ type: 'error', message: 'Failed to refresh devices' })
        }
    }

    return (
        <div className="dashboard">
            <header className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <MonitorSmartphone />
                    </div>
                    <div className="header-text">
                        <h1>Device Dashboard</h1>
                        <p>Connected Android devices are automatically detected</p>
                    </div>
                </div>
                <button className="refresh-btn" onClick={handleRefresh}>
                    <RefreshCw size={18} />
                    <span>Refresh</span>
                </button>
            </header>

            <div className="dashboard-content">
                {devices.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Smartphone size={64} />
                        </div>
                        <h2>No Devices Connected</h2>
                        <p>Connect an Android device via USB to get started</p>
                        <div className="empty-steps">
                            <div className="step">
                                <span className="step-number">1</span>
                                <span className="step-text">Enable USB Debugging on your device</span>
                            </div>
                            <div className="step">
                                <span className="step-number">2</span>
                                <span className="step-text">Connect via USB cable</span>
                            </div>
                            <div className="step">
                                <span className="step-number">3</span>
                                <span className="step-text">Accept the debugging prompt on your device</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="devices-grid">
                        {devices.map(device => (
                            <DeviceCard
                                key={device.serial}
                                device={device}
                                isSelected={selectedDevice?.serial === device.serial}
                                onSelect={() => onSelectDevice(device)}
                                onToast={onToast}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
