import {
    Smartphone,
    HardDrive,
    Terminal,
    Wrench,
    Zap,
    ArrowRight,
    Cable,
    Shield
} from 'lucide-react'
import './Welcome.css'

interface WelcomeProps {
    onNavigate: (view: string) => void
    hasDevice: boolean
}

export function Welcome({ onNavigate, hasDevice }: WelcomeProps) {
    return (
        <div className="welcome">
            <div className="welcome-content">
                <div className="welcome-hero">
                    <div className="hero-glow" />
                    <div className="hero-icon">
                        <Zap size={48} />
                    </div>
                    <h1 className="hero-title">
                        ADB <span className="gradient-text">Commander</span>
                    </h1>
                    <p className="hero-subtitle">
                        A modern, cross-platform GUI for Android Debug Bridge.
                        Manage your Android devices with ease — backup files, install apps,
                        capture screens, and run power-user commands, all from one place.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="hero-btn primary"
                            onClick={() => onNavigate('dashboard')}
                        >
                            <Smartphone size={18} />
                            <span>{hasDevice ? 'View Devices' : 'Get Started'}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="features-grid">
                    <button className="feature-card" onClick={() => onNavigate('dashboard')}>
                        <div className="feature-icon">
                            <Smartphone size={24} />
                        </div>
                        <h3>Device Management</h3>
                        <p>Auto-detect connected devices, view device info, battery status, and open ADB shell instantly.</p>
                    </button>

                    <button className="feature-card" onClick={() => onNavigate('backup')}>
                        <div className="feature-icon">
                            <HardDrive size={24} />
                        </div>
                        <h3>Backup & Restore</h3>
                        <p>Selectively backup folders or browse the full file tree. Push files to any directory on your device.</p>
                    </button>

                    <button className="feature-card" onClick={() => onNavigate('actions')}>
                        <div className="feature-icon">
                            <Wrench size={24} />
                        </div>
                        <h3>Quick Actions</h3>
                        <p>Install APKs with drag-and-drop, take screenshots, record screen, and reboot to different modes.</p>
                    </button>

                    <button className="feature-card" onClick={() => onNavigate('powertools')}>
                        <div className="feature-icon">
                            <Terminal size={24} />
                        </div>
                        <h3>Power Tools</h3>
                        <p>List &amp; disable packages, send key inputs, run logcat, reboot to fastboot, and more.</p>
                    </button>
                </div>

                <div className="getting-started">
                    <h2>Getting Started</h2>
                    <div className="steps-row">
                        <div className="step-card">
                            <div className="step-num">1</div>
                            <div className="step-icon"><Shield size={20} /></div>
                            <h4>Enable USB Debugging</h4>
                            <p>Go to Settings → Developer Options → USB Debugging on your Android device</p>
                        </div>
                        <div className="step-card">
                            <div className="step-num">2</div>
                            <div className="step-icon"><Cable size={20} /></div>
                            <h4>Connect via USB</h4>
                            <p>Plug in your device with a USB cable and accept the debugging prompt</p>
                        </div>
                        <div className="step-card">
                            <div className="step-num">3</div>
                            <div className="step-icon"><Zap size={20} /></div>
                            <h4>You're All Set</h4>
                            <p>Your device will appear automatically. Start managing it right away!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
