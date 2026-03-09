import { useUIStore } from '@/stores/ui-store';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastType } from '@/types';

const typeConfig: Record<ToastType, { bg: string; icon: typeof CheckCircle }> = {
  success: { bg: 'bg-success', icon: CheckCircle },
  error: { bg: 'bg-danger', icon: AlertCircle },
  warning: { bg: 'bg-warning', icon: AlertTriangle },
  info: { bg: 'bg-accent', icon: Info },
};

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type];
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg animate-slide-in-right min-w-[280px] max-w-[400px]',
              config.bg,
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 cursor-pointer shrink-0 hover:opacity-70 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
