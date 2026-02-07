import { useState } from 'react'
import { Wifi, Loader2, Link, Unlink } from 'lucide-react'
import type { Toast } from '../../types'
import './WirelessConnect.css'

interface WirelessConnectProps {
    onToast: (toast: Omit<Toast, 'id'>) => void
}

export function WirelessConnect({ onToast }: WirelessConnectProps) {
    const [ip, setIp] = useState('')
    const [port, setPort] = useState('5555')
    const [isConnecting, setIsConnecting] = useState(false)
    const [connectedDevices, setConnectedDevices] = useState<string[]>([])

    const handleConnect = async () => {
        if (!ip.trim()) {
            onToast({ type: 'warning', message: 'Please enter an IP address' })
            return
        }

        setIsConnecting(true)
        try {
            const result = await window.adb.connectWireless(ip.trim(), parseInt(port))
            if (result.success) {
                onToast({ type: 'success', message: `Connected to ${ip}:${port}` })
                setConnectedDevices(prev => [...prev, `${ip}:${port}`])
                setIp('')
            } else {
                onToast({ type: 'error', message: result.message })
            }
        } catch (error) {
            onToast({ type: 'error', message: 'Connection failed' })
        } finally {
            setIsConnecting(false)
        }
    }

    const handleDisconnect = async (address: string) => {
        const [deviceIp, devicePort] = address.split(':')
        try {
            await window.adb.disconnectWireless(deviceIp, parseInt(devicePort))
            setConnectedDevices(prev => prev.filter(d => d !== address))
            onToast({ type: 'info', message: `Disconnected from ${address}` })
        } catch (error) {
            onToast({ type: 'error', message: 'Disconnect failed' })
        }
    }

    return (
        <div className="wireless-connect">
            <header className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Wifi />
                    </div>
                    <div className="header-text">
                        <h1>Wireless ADB</h1>
                        <p>Connect to devices over Wi-Fi</p>
                    </div>
                </div>
            </header>

            <div className="wireless-content">
                <section className="connect-section">
                    <h2>Connect to Device</h2>
                    <div className="connect-form">
                        <div className="input-group">
                            <label>IP Address</label>
                            <input
                                type="text"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                placeholder="192.168.1.100"
                                disabled={isConnecting}
                            />
                        </div>
                        <div className="input-group port-input">
                            <label>Port</label>
                            <input
                                type="text"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                placeholder="5555"
                                disabled={isConnecting}
                            />
                        </div>
                        <button
                            className="connect-btn"
                            onClick={handleConnect}
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 size={18} className="spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Link size={18} />
                                    Connect
                                </>
                            )}
                        </button>
                    </div>

                    <div className="help-text">
                        <h3>How to enable Wireless ADB:</h3>
                        <ol>
                            <li>Connect your device via USB</li>
                            <li>Enable USB Debugging in Developer Options</li>
                            <li>Run <code>adb tcpip 5555</code> in terminal</li>
                            <li>Disconnect USB and enter device IP above</li>
                        </ol>
                        <p>
                            <strong>Tip:</strong> Find your device IP in Settings → About Phone → Status → IP Address
                        </p>
                    </div>
                </section>

                {connectedDevices.length > 0 && (
                    <section className="connected-section">
                        <h2>Connected Devices</h2>
                        <div className="connected-list">
                            {connectedDevices.map(address => (
                                <div key={address} className="connected-item">
                                    <Wifi size={18} className="wifi-icon" />
                                    <span className="address">{address}</span>
                                    <button
                                        className="disconnect-btn"
                                        onClick={() => handleDisconnect(address)}
                                    >
                                        <Unlink size={16} />
                                        Disconnect
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
