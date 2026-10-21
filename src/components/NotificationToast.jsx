import React from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export default function NotificationToast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let typeClass = "toast-success";
        if (toast.type === "info") {
          Icon = Info;
          typeClass = "toast-info";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          typeClass = "toast-warning";
        }

        return (
          <div key={toast.id} className={`toast ${typeClass}`}>
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                style={{ color: "rgba(255,255,255,0.7)", marginLeft: 6 }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
