import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import './Toast.css'

export interface Toast {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
}

interface ToasterProps {
    toasts: Toast[]
    onRemove: (id: string) => void
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
    return (
        <div className="toaster">
            {toasts.map(toast => {
                const Icon = icons[toast.type]
                return (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <Icon className="toast-icon" size={18} />
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => onRemove(toast.id)}>
                            <X size={16} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
