'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let toastId = 0;
const listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function updateToasts(newToasts: Toast[]) {
  toasts = newToasts;
  listeners.forEach((listener) => listener(toasts));
}

export function toast(type: ToastType, message: string) {
  const id = String(++toastId);
  updateToasts([...toasts, { id, type, message }]);

  setTimeout(() => {
    updateToasts(toasts.filter((t) => t.id !== id));
  }, 5000);
}

export default function ToastContainer() {
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setLocalToasts);
    return () => {
      listeners.splice(listeners.indexOf(setLocalToasts), 1);
    };
  }, []);

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <AlertTriangle className="w-5 h-5 text-blue-500" />,
  };

  const borderMap = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {localToasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-start gap-3 p-4 bg-white rounded-lg shadow-lg border-l-4 ${borderMap[t.type]}
            animate-slide-up
          `}
        >
          {iconMap[t.type]}
          <p className="text-sm text-slate-700 flex-1">{t.message}</p>
          <button
            onClick={() => updateToasts(toasts.filter((toast) => toast.id !== t.id))}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}